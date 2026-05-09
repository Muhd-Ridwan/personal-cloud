// src/middleware.js

import { verifyJWT } from './auth.js';
import { getConfig } from './config.js';

// Protect routes — verify JWT token on every request
export async function authMiddleware(c, next) {
	const authHeader = c.req.header('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const token = authHeader.split(' ')[1];
	const config = getConfig(c.env);
	const payload = await verifyJWT(token, config.jwt.secret);

	if (!payload) {
		return c.json({ error: 'Invalid or expired token' }, 401);
	}

	// Attach user info to context so routes can access it
	c.set('user', payload);
	await next();
}

// CORS headers — allows frontend to talk to Worker
export function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};
}
