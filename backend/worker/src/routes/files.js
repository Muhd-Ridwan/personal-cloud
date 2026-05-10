// src/routes/files.js

import { Hono } from 'hono';
import { authMiddleware } from '../middleware.js';
import { listUserFiles, uploadFile, deleteFile, getFile } from '../r2.js';
import { getConfig } from '../config.js';

const router = new Hono();

// Apply auth middleware to all file routes
router.use('*', authMiddleware);

// GET /files — list all files for logged in user
router.get('/', async (c) => {
	try {
		const { username } = c.get('user');
		const config = getConfig(c.env);
		const files = await listUserFiles(config.r2.bucket, username);

		const filesWithMeta = await Promise.all(
			files.map(async (file) => {
				const metaKey = `meta:${username}:${file.name}`;
				const meta = await config.kv.fileMeta.get(metaKey, 'json');
				return {
					...file,
					id: file.key,
					starred: meta?.starred ?? false,
					trashed: meta?.trashed ?? false,
				};
			}),
		);

		return c.json({ files: filesWithMeta });
	} catch (err) {
		return c.json({ error: 'Failed to list files' }, 500);
	}
});

// POST /files/upload — upload a file
router.post('/upload', async (c) => {
	try {
		const { username } = c.get('user');
		const config = getConfig(c.env);
		const formData = await c.req.formData();
		const file = formData.get('file');

		if (!file) {
			return c.json({ error: 'No file provided' }, 400);
		}

		const buffer = await file.arrayBuffer();
		const key = await uploadFile(config.r2.bucket, username, file.name, buffer, file.type);

		return c.json({ key, name: file.name, size: file.size }, 201);
	} catch (err) {
		return c.json({ error: 'Upload failed' }, 500);
	}
});

// GET /files/download/:key — download a file
router.get('/download/:key', async (c) => {
	try {
		const { username } = c.get('user');
		const config = getConfig(c.env);
		const key = decodeURIComponent(c.req.param('key'));
		const object = await getFile(config.r2.bucket, username, key);

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
		const config = getConfig(c.env);
		const key = decodeURIComponent(c.req.param('key'));
		await deleteFile(config.r2.bucket, username, key);
		return c.json({ success: true });
	} catch (err) {
		if (err.message.includes('Unauthorized')) {
			return c.json({ error: 'Unauthorized' }, 403);
		}
		return c.json({ error: 'Delete failed' }, 500);
	}
});

// PATCH /files/star/:key - toggle starred
router.patch('/star/:key', async (c) => {
	try {
		const { username } = c.get('user');
		const config = getConfig(c.env);
		const key = decodeURIComponent(c.req.param('key'));
		const filename = key.replace(`users/${username}/`, '');
		const metaKey = `meta:${username}:${filename}`;

		const existing = (await config.kv.fileMeta.get(metaKey, 'json')) || {};
		const starred = !existing.starred;
		await config.kv.fileMeta.put(metaKey, JSON.stringify({ ...existing, starred }));

		return c.json({ starred });
	} catch (err) {
		return c.json({ error: 'Failed to toggle star' }, 500);
	}
});

// PATCH /files/trash/:key — move to trash
router.patch('/trash/:key', async (c) => {
	try {
		const { username } = c.get('user');
		const config = getConfig(c.env);
		const key = decodeURIComponent(c.req.param('key'));
		const filename = key.replace(`users/${username}/`, '');
		const metaKey = `meta:${username}:${filename}`;

		const existing = (await config.kv.fileMeta.get(metaKey, 'json')) || {};
		await config.kv.fileMeta.put(metaKey, JSON.stringify({ ...existing, trashed: true, trashedAt: new Date().toISOString() }));

		return c.json({ success: true });
	} catch (err) {
		return c.json({ error: 'Failed to trash file' }, 500);
	}
});

// PATCH /files/restore/:key — restore from trash
router.patch('/restore/:key', async (c) => {
	try {
		const { username } = c.get('user');
		const config = getConfig(c.env);
		const key = decodeURIComponent(c.req.param('key'));
		const filename = key.replace(`users/${username}/`, '');
		const metaKey = `meta:${username}:${filename}`;

		const existing = (await config.kv.fileMeta.get(metaKey, 'json')) || {};
		const { trashedAt, ...rest } = existing;
		await config.kv.fileMeta.put(metaKey, JSON.stringify({ ...rest, trashed: false }));

		return c.json({ success: true });
	} catch (err) {
		return c.json({ error: 'Failed to restore file' }, 500);
	}
});

export default router;
