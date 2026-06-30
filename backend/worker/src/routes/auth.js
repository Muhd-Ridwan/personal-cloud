// src/routes/auth.js
import { sendResetEmail } from '../email.js';
import { Hono } from 'hono';
import { hashPassword, generateSalt, verifyPassword, createJWT } from '../auth.js';
import { getConfig } from '../config.js';

const router = new Hono();

// POST /auth/register — create a new user
router.post('/register', async (c) => {
	try {
		const { username, password } = await c.req.json();
		const config = getConfig(c.env);

		if (!username || !password) {
			return c.json({ error: 'Username and password are required' }, 400);
		}

		if (password.length < 6) {
			return c.json({ error: 'Password must be at least 6 characters' }, 400);
		}

		// Check if user already exists
		const existing = await config.kv.users.get(username);
		if (existing) {
			return c.json({ error: 'Username already taken' }, 409);
		}

		// Hash password with salt
		const salt = generateSalt();
		const hashedPassword = await hashPassword(password, salt);

		// Store user in KV
		const userData = {
			username,
			salt,
			password: hashedPassword,
			createdAt: new Date().toISOString(),
		};
		await config.kv.users.put(username, JSON.stringify(userData));

		// Create JWT token
		const token = await createJWT({ username }, config.jwt.secret);

		return c.json({ token, username }, 201);
	} catch (err) {
		console.error('Register error:', err.message, err.stack);
		return c.json({ error: err.message }, 500);
	}
});

// POST /auth/login — login existing user
router.post('/login', async (c) => {
	try {
		const { username, password } = await c.req.json();
		const config = getConfig(c.env);

		if (!username || !password) {
			return c.json({ error: 'Username and password are required' }, 400);
		}

		// Get user from KV
		const raw = await config.kv.users.get(username);
		if (!raw) {
			return c.json({ error: 'Invalid username or password' }, 401);
		}

		const userData = JSON.parse(raw);

		// Verify password
		const valid = await verifyPassword(password, userData.salt, userData.password);
		if (!valid) {
			return c.json({ error: 'Invalid username or password' }, 401);
		}

		// Create JWT token
		const token = await createJWT({ username }, config.jwt.secret);

		return c.json({ token, username, role: userData.role });
	} catch (err) {
		console.error('Login error:', err.message, err.stack);
		return c.json({ error: err.message }, 500);
	}
});

// POST /auth/request - submit registration request
router.post('/request', async (c) => {
	try {
		const { username, email, password, reason } = await c.req.json();
		const config = getConfig(c.env);

		if (!username || !email || !password || !reason) {
			return c.json({ error: 'All fields are required' }, 400);
		}
		if (password.length < 6) {
			return c.json({ error: 'Password must be at least 6 characters' }, 400);
		}

		const existing = await config.kv.users.get(username);
		if (existing) return c.json({ error: 'Username already taken' }, 409);

		const list = await config.kv.requests.list();
		for (const key of list.keys) {
			const raw = await config.kv.requests.get(key.name);
			const req = JSON.parse(raw);
			if (req.username === username && req.status === 'pending') {
				return c.json({ error: 'Request already submitted' }, 409);
			}
		}
		const id = `req_${Date.now()}`;
		const requestData = {
			id,
			username,
			email,
			password,
			reason,
			status: 'pending',
			createdAt: new Date().toISOString(),
		};
		await config.kv.requests.put(id, JSON.stringify(requestData));

		return c.json({ success: true, message: 'Request submitted, waiting for admin approval' });
	} catch (err) {
		console.error('Request error:', err.message);
		return c.json({ error: err.message }, 500);
	}
});

router.get('/google', (c) => {
	const config = getConfig(c.env);
	const params = new URLSearchParams({
		client_id: config.google.clientId,
		redirect_uri: config.google.redirectUri,
		response_type: 'code',
		scope: 'openid email profile',
		access_type: 'offline',
		prompt: 'select_account',
	});

	return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/google/callback', async (c) => {
	try {
		const code = c.req.query('code');
		const config = getConfig(c.env);
		if (!code) return c.json({ error: 'No code provided' }, 400);

		const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				code,
				client_id: config.google.clientId,
				client_secret: config.google.clientSecret,
				redirect_uri: config.google.redirectUri,
				grant_type: 'authorization_code',
			}),
		});

		const tokenData = await tokenRes.json();
		if (!tokenRes.ok) return c.json({ error: 'Failed to exchange code' }, 400);

		const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
			headers: { Authorization: `Bearer ${tokenData.access_token}` },
		});

		const googleUser = await userRes.json();
		const username = googleUser.email;

		const existing = await config.kv.users.get(username);
		if (!existing) {
			return c.redirect(`${config.frontendUrl}/login?newgoogle=true&email=${encodeURIComponent(username)}`);
		}

		const token = await createJWT({ username }, config.jwt.secret);

		return c.redirect(`${config.frontendUrl}/auth/callback?token=${token}&username=${encodeURIComponent(username)}`);
	} catch (err) {
		console.log('Google callback error:', err.message);
		return c.json({ error: 'Google login failed' }, 500);
	}
});

router.post('/seed', async (c) => {
	try {
		const config = getConfig(c.env);

		const list = await config.kv.users.list();
		for (const key of list.keys) {
			const raw = await config.kv.users.get(key.name);
			const user = JSON.parse(raw);
			if (user.role === 'admin') {
				return c.json({ error: 'Admin already exists' }, 409);
			}
		}

		const { username, password, email } = await c.req.json();
		if (!username || !password || !email) {
			return c.json({ error: 'Username, password and email are required' }, 400);
		}

		const salt = generateSalt();
		const hashedPassword = await hashPassword(password, salt);
		const adminData = {
			username,
			email,
			salt,
			password: hashedPassword,
			role: 'admin',
			createdAt: new Date().toISOString(),
		};
		await config.kv.users.put(username, JSON.stringify(adminData));

		return c.json({ success: true, message: `Admin account created for ${username}` });
	} catch (err) {
		console.error('Seed error: ', err.message);
		return c.json({ error: 'Failed to create admin' }, 500);
	}
});

// POST /auth/forgot-password
router.post('/forgot-password', async (c) => {
	try {
		const { email } = await c.req.json();
		const config = getConfig(c.env);

		if (!email) return c.json({ error: 'Email is required' }, 400);

		// Find user by email
		const list = await config.kv.users.list();
		let matchedUsername = null;
		for (const key of list.keys) {
			const raw = await config.kv.users.get(key.name);
			const user = JSON.parse(raw);
			if (user.email === email) {
				matchedUsername = user.username;
				break;
			}
		}

		// RETURN SUCCESS TO AVOID EMAIL ENUMERATION
		if (!matchedUsername) {
			return c.json({ success: true, message: 'If the email exists, a reset link has been sent' });
		}

		// GENERATE TOKEN
		const token = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
		await config.kv.resetTokens.put(token, JSON.stringify({ username: matchedUsername, email, expiresAt }), { expirationTtl: 3600 });

		const resetLink = `${config.frontendUrl}/reset-password?token=${token}`;
		await sendResetEmail(email, resetLink, config.email.resendApiKey, config.email.fromAddress);

		return c.json({ success: true, message: 'If that email exists, a reset link has been sent' });
	} catch (err) {
		console.error('Forgot password error:', err.message);
		return c.json({ error: 'Failed to process request' }, 500);
	}
});

// POST /auth/reset-password
router.post('/reset-password', async (c) => {
	try {
		const { token, newPassword } = await c.req.json();
		const config = getConfig(c.env);

		if (!token || !newPassword) return c.json({ error: 'Token and new password are required' }, 400);
		if (newPassword.length < 6) return c.json({ error: 'Password must be at least 6 characters' }, 400);

		const raw = await config.kv.resetTokens.get(token);
		if (!raw) return c.json({ error: 'Invalid or expired token' }, 400);

		const { username, expiresAt } = JSON.parse(raw);
		if (new Date() > new Date(expiresAt)) {
			await config.kv.resetTokens.delete(token);
			return c.json({ error: 'Token has expired' }, 400);
		}

		// UPDATE PASSWORD
		const userRaw = await config.kv.users.get(username);
		if (!userRaw) return c.json({ error: 'User not found' }, 400);

		const user = JSON.parse(userRaw);
		const salt = generateSalt();
		const hashedPassword = await hashPassword(newPassword, salt);
		user.salt = salt;
		user.password = hashedPassword;
		await config.kv.users.put(username, JSON.stringify(user));

		// DELETE USED TOKEN
		await config.kv.resetTokens.delete(token);

		return c.json({ success: true, message: 'Password reset successfully' });
	} catch (err) {
		console.error('Reset password error:', err.message);
		return c.json({ error: 'Failed to reset password' }, 500);
	}
});

export default router;
