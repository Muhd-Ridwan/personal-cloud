// src/index.js

import { Hono } from 'hono';
import { corsHeaders } from './middleware.js';
import authRouter from './routes/auth.js';
import filesRouter from './routes/files.js';
import foldersRouter from './routes/folders.js';
import adminRouter from './routes/admin.js';
import { getConfig } from './config.js';

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
	if (c.res.status >= 300 && c.res.status < 400) return;
	Object.entries(corsHeaders()).forEach(([key, value]) => {
		c.res.headers.set(key, value);
	});
});

// Routes
app.route('/auth', authRouter);
app.route('/files', filesRouter);
app.route('/folders', foldersRouter);
app.route('/admin', adminRouter);

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

// GET /public/:key
app.get('/public/:key', async (c) => {
	const key = decodeURIComponent(c.req.param('key'));
	if (!key.startsWith('users/')) {
		return c.json({ error: 'Inavlid Key' }, 400);
	}

	const parts = key.split('/');
	const username = parts[1];
	const filename = parts.slice(2).join('/');
	const config = getConfig(c.env);
	const meta = await config.kv.fileMeta.get(`meta:${username}:${filename}`, 'json');

	if (!meta?.public) {
		return c.json({ error: 'Not Found' }, 404);
	}

	const object = await config.r2.bucket.get(key);
	if (!object) return c.json({ error: 'File not found' }, 404);

	const headers = new Headers();
	headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
	headers.set('Cache-Control', 'public, max-age=31536000');

	return new Response(object.body, { headers });
});

export default app;
