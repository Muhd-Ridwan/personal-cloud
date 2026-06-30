import { Hono } from 'hono';
import { authMiddleware } from '../middleware.js';
import { hashPassword, generateSalt, createJWT } from '../auth.js';
import { getConfig } from '../config.js';

const router = new Hono();

// PROTECT ALL ADMIN ROUTES + CHECK ADMIN ROLE
router.use('*', authMiddleware);
router.use('*', async (c, next) => {
	const config = getConfig(c.env);
	const user = c.get('user');
	const raw = await config.kv.users.get(user.username);
	if (!raw) return c.json({ error: 'Unauthorized' }, 401);
	const userData = JSON.parse(raw);
	if (userData.role !== 'admin') {
		return c.json({ error: 'Forbidden - admin only' }, 403);
	}
	await next();
});

// GET /admin/requests - list all requests
router.get('/requests', async (c) => {
	try {
		const config = getConfig(c.env);
		const list = await config.kv.requests.list();
		const requests = await Promise.all(
			list.keys.map(async (key) => {
				const raw = await config.kv.requests.get(key.name);
				const req = JSON.parse(raw);
				const { password, ...safeReq } = req;
				return safeReq;
			}),
		);

		requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
		return c.json({ requests });
	} catch (err) {
		return c.json({ error: 'Failed to fetch requests' }, 500);
	}
});

// POST /admin/requests/:id/approve - approve a request
router.post('/requests/:id/approve', async (c) => {
	try {
		const config = getConfig(c.env);
		const id = c.req.param('id');
		const raw = await config.kv.requests.get(id);
		if (!raw) return c.json({ error: 'Request not found' }, 404);

		const request = JSON.parse(raw);
		if (request.status !== 'pending') {
			return c.json({ error: 'Request already processed' }, 400);
		}

		// Check if username already taken or not
		const existing = await config.kv.users.get(request.username);
		if (existing) return c.json({ error: 'Username already taken' }, 409);

		// Create user account
		const salt = generateSalt();
		const hashedPassword = await hashPassword(request.password, salt);
		const userData = {
			username: request.username,
			email: request.email,
			salt,
			password: hashedPassword,
			role: 'user',
			createdAt: new Date().toISOString(),
		};
		await config.kv.users.put(request.username, JSON.stringify(userData));

		// Update request status
		request.status = 'approved';
		request.processedAt = new Date().toISOString();
		await config.kv.requests.put(id, JSON.stringify(request));

		return c.json({ success: true, message: `Account created for ${request.username}` });
	} catch (err) {
		return c.json({ error: 'Failed to approve request' }, 500);
	}
});

// POST /admin/requests/:id/reject - Reject a request
router.post('/requests/:id/reject', async (c) => {
	try {
		const config = getConfig(c.env);
		const id = c.req.param('id');
		const raw = await config.kv.requests.get(id);
		if (!raw) return c.json({ error: 'Request not found' }, 404);

		const request = JSON.parse(raw);
		if (request.status !== 'pending') {
			return c.json({ error: 'Request already processed' }, 400);
		}

		request.status = 'rejected';
		request.processedAt = new Date().toISOString();
		await config.kv.requests.put(id, JSON.stringify(request));

		return c.json({ success: true, message: 'Request Rejected' });
	} catch (err) {
		return c.json({ error: 'Failed to reject request' }, 500);
	}
});

// GET /admin/users - list all users
router.get('/users', async (c) => {
	try {
		const config = getConfig(c.env);
		const list = await config.kv.users.list();
		const users = await Promise.all(
			list.keys.map(async (key) => {
				const raw = await config.kv.users.get(key.name);
				const user = JSON.parse(raw);

				return {
					username: user.username,
					kvKey: key.name,
					email: user.email,
					role: user.role,
					createdAt: user.createdAt,
					provider: user.provider || 'local',
				};
			}),
		);
		return c.json({ users });
	} catch (err) {
		return c.json({ error: 'Failed to fetch users' }, 500);
	}
});

// DELETE /admin/users/:username - Delete a user
router.delete('/users/:username', async (c) => {
	try {
		const config = getConfig(c.env);
		const username = c.req.param('username');
		const admin = c.get('user');

		if (username === admin.username) {
			return c.json({ error: 'Cannot delete your own account' }, 400);
		}

		const existing = await config.kv.users.get(username);
		if (!existing) return c.json({ error: 'User not found' }, 404);

		await config.kv.users.delete(username);
		return c.json({ success: true, message: `User ${username} deleted` });
	} catch (err) {
		return c.json({ error: 'Failed to delete user' }, 500);
	}
});

export default router;
