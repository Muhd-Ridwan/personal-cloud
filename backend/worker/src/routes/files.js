// src/routes/files.js

import { Hono } from 'hono';
import { authMiddleware } from '../middleware.js';
import { listUserFiles, uploadFile, deleteFile, getFile } from '../r2.js';

const router = new Hono();

// Apply auth middleware to all file routes
router.use('*', authMiddleware);

// GET /files — list all files for logged in user
router.get('/', async (c) => {
	try {
		const { username } = c.get('user');
		const files = await listUserFiles(c.env.personal_cloud_files, username);
		return c.json({ files });
	} catch (err) {
		return c.json({ error: 'Failed to list files' }, 500);
	}
});

// POST /files/upload — upload a file
router.post('/upload', async (c) => {
	try {
		const { username } = c.get('user');
		const formData = await c.req.formData();
		const file = formData.get('file');

		if (!file) {
			return c.json({ error: 'No file provided' }, 400);
		}

		const buffer = await file.arrayBuffer();
		const key = await uploadFile(c.env.personal_cloud_files, username, file.name, buffer, file.type);

		return c.json({ key, name: file.name, size: file.size }, 201);
	} catch (err) {
		return c.json({ error: 'Upload failed' }, 500);
	}
});

// GET /files/download/:key — download a file
router.get('/download/:key', async (c) => {
	try {
		const { username } = c.get('user');
		const key = decodeURIComponent(c.req.param('key'));
		const object = await getFile(c.env.personal_cloud_files, username, key);

		if (!object) {
			return c.json({ error: 'File not found' }, 404);
		}

		const headers = new Headers();
		headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
		headers.set('Content-Disposition', `attachment; filename="${key.split('/').pop()}"`);

		return new Response(object.body, { headers });
	} catch (err) {
		if (err.message.includes('Unauthorized')) {
			return c.json({ error: 'Unauthorized' }, 403);
		}
		return c.json({ error: 'Download failed' }, 500);
	}
});

// DELETE /files/:key — delete a file
router.delete('/:key', async (c) => {
	try {
		const { username } = c.get('user');
		const key = decodeURIComponent(c.req.param('key'));
		await deleteFile(c.env.personal_cloud_files, username, key);
		return c.json({ success: true });
	} catch (err) {
		if (err.message.includes('Unauthorized')) {
			return c.json({ error: 'Unauthorized' }, 403);
		}
		return c.json({ error: 'Delete failed' }, 500);
	}
});

export default router;
