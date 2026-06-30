import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, generateSalt, createJWT } from '../src/auth.js';

const TEST_SECRET = 'test-secret';

async function seedUser(username, password, role = 'user') {
	const salt = generateSalt();
	const hashed = await hashPassword(password, salt);
	await env.USERS.put(
		username,
		JSON.stringify({
			username,
			email: `${username}@test.com`,
			salt,
			password: hashed,
			role,
			createdAt: new Date().toISOString(),
		}),
	);
}

async function tokenFor(username) {
	return createJWT({ username }, TEST_SECRET);
}

async function clearUsers() {
	const list = await env.USERS.list();
	for (const key of list.keys) await env.USERS.delete(key.name);
}

// ─── Auth: Login ────────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
	beforeEach(async () => {
		await clearUsers();
		await seedUser('alice', 'password123', 'user');
	});

	it('returns token for valid credentials', async () => {
		const res = await SELF.fetch('http://worker/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: 'alice', password: 'password123' }),
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.token).toBeDefined();
		expect(data.username).toBe('alice');
	});

	it('rejects wrong password with 401', async () => {
		const res = await SELF.fetch('http://worker/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: 'alice', password: 'wrongpass' }),
		});
		expect(res.status).toBe(401);
	});

	it('rejects unknown user with 401', async () => {
		const res = await SELF.fetch('http://worker/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: 'nobody', password: 'password123' }),
		});
		expect(res.status).toBe(401);
	});

	it('rejects missing fields with 400', async () => {
		const res = await SELF.fetch('http://worker/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: 'alice' }),
		});
		expect(res.status).toBe(400);
	});
});

// ─── Admin Middleware ────────────────────────────────────────────────────────

describe('Admin middleware - GET /admin/users', () => {
	beforeEach(async () => {
		await clearUsers();
		await seedUser('admin', 'adminpass', 'admin');
		await seedUser('regular', 'userpass', 'user');
	});

	it('blocks request with no token', async () => {
		const res = await SELF.fetch('http://worker/admin/users');
		expect(res.status).toBe(401);
	});

	it('blocks request with invalid token', async () => {
		const res = await SELF.fetch('http://worker/admin/users', {
			headers: { Authorization: 'Bearer invalidtoken' },
		});
		expect(res.status).toBe(401);
	});

	it('blocks non-admin user with 403', async () => {
		const token = await tokenFor('regular');
		const res = await SELF.fetch('http://worker/admin/users', {
			headers: { Authorization: `Bearer ${token}` },
		});
		expect(res.status).toBe(403);
	});

	it('allows admin user and returns users list', async () => {
		const token = await tokenFor('admin');
		const res = await SELF.fetch('http://worker/admin/users', {
			headers: { Authorization: `Bearer ${token}` },
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(Array.isArray(data.users)).toBe(true);
	});
});
