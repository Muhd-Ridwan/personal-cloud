// src/routes/auth.js

import { Hono } from 'hono';
import { hashPassword, generateSalt, verifyPassword, createJWT } from '../auth.js';

const router = new Hono();

// POST /auth/register — create a new user
router.post('/register', async (c) => {
	try {
		const { username, password } = await c.req.json();

		if (!username || !password) {
			return c.json({ error: 'Username and password are required' }, 400);
		}

		if (password.length < 6) {
			return c.json({ error: 'Password must be at least 6 characters' }, 400);
		}

		// Check if user already exists
		const existing = await c.env.USERS.get(username);
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
		await c.env.USERS.put(username, JSON.stringify(userData));

		// Create JWT token
		const token = await createJWT({ username }, c.env.JWT_SECRET);

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

		if (!username || !password) {
			return c.json({ error: 'Username and password are required' }, 400);
		}

		// Get user from KV
		const raw = await c.env.USERS.get(username);
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
		const token = await createJWT({ username }, c.env.JWT_SECRET);

		return c.json({ token, username });
	} catch (err) {
		console.error('Login error:', err.message, err.stack);
		return c.json({ error: err.message }, 500);
	}
});

router.get('/google', (c) => {
	const params = new URLSearchParams({
		client_id: c.env.GOOGLE_CLIENT_ID,
		redirect_uri: c.event.GOOGLE_REDIRECT_URI,
		response_type: 'code',
		scope: 'openid email profile',
		access_type: 'offline',
		prompt: 'select_account',
	});

	return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/google/callback', async (c) => {
	try {
		const code = c.req.query('code');
		if (!code) return c.json({ error: 'No code provided' }, 400);

		const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www.form-urlencoded' },
			body: new URLSearchParams({
				code,
				client_id: c.env.GOOGLE_CLIENT_ID,
				client_secret: c.env.GOOGLE_CLIENT_SECRET,
				redirect_uri: c.env.GOOGLE_REDIRECT_URI,
				grant_type: 'authorization_code',
			}),
		});

		const tokenData = await tokenRes.json();
		if (!tokenRes.ok) return c.json({ erro: 'Failed to exchange code' }, 400);

		const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
			headers: { Authorization: `Bearer ${tokenData.access_token}` },
		});

		const googleUser = await userRes.json();
		const username = googleUser.email;

		const exisitng = await c.env.USERS.get(username);
		if (!existing) {
			const userData = {
				username,
				email: googleUser.email,
				name: googleUser.name,
				picture: googleUser.picture,
				provider: 'google',
				createdAt: new Date().toISOString(),
			};
			await c.env.USERS.put(username, JSON.stringify(userData));
		}

		const token = await createJWT({ username }, c.env.JWT_SECRET);

		return Response.redirect(`https://localhost:5173/auth/callback?token=${token}&username=${encodeURIComponent(username)}`);
	} catch (err) {
		console.log('Google callback error:', err.message);
		return c.json({ error: 'Google login failed' }, 500);
	}
});

export default router;
