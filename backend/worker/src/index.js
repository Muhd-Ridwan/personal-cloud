// src/index.js

import { Hono } from 'hono';
import { corsHeaders } from './middleware.js';
import authRouter from './routes/auth.js';
import filesRouter from './routes/files.js';

const app = new Hono();

// Handle CORS preflight requests
app.options('*', (c) => {
	return new Response(null, {
		status: 204,
		headers: corsHeaders(),
	});
});

// Add CORS headers to every response
app.use('*', async (c, next) => {
	await next();
	Object.entries(corsHeaders()).forEach(([key, value]) => {
		c.res.headers.set(key, value);
	});
});

// Routes
app.route('/auth', authRouter);
app.route('/files', filesRouter);

// Health check
app.get('/', (c) => {
	return c.json({ status: 'ok', message: 'Personal Cloud API' });
});

// 404 handler
app.notFound((c) => {
	return c.json({ error: 'Route not found' }, 404);
});

// Error handler
app.onError((err, c) => {
	console.error(err);
	return c.json({ error: 'Internal server error' }, 500);
});

export default app;
