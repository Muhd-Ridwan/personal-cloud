import { Hono } from 'hono';
import { authMiddleware } from '../middleware.js';
import { getConfig } from '../config.js';

const router = new Hono();
router.use('*', authMiddleware);

// GET /folders — list all folders for logged in user
router.get('/', async (c) => {
	try {
		const { username } = c.get('user');
		const config = getConfig(c.env);
		const list = await config.kv.fileMeta.list({ prefix: `folder:${username}:` });
		const folders = await Promise.all(
			list.keys.map(({ name }) => config.kv.fileMeta.get(name, 'json')),
		);
		return c.json({ folders: folders.filter(Boolean) });
	} catch (err) {
		return c.json({ error: 'Failed to list folders' }, 500);
	}
});

// POST /folders — create a folder
router.post('/', async (c) => {
	try {
		const { username } = c.get('user');
		const config = getConfig(c.env);
		const { name, parentFolderId = null } = await c.req.json();

		if (!name || name.includes('/') || name.includes('..')) {
			return c.json({ error: 'Invalid folder name' }, 400);
		}

		const id = crypto.randomUUID();
		const folder = {
			id,
			name,
			type: 'folder',
			parentFolderId,
			trashed: false,
			createdAt: new Date().toISOString(),
		};

		await config.kv.fileMeta.put(`folder:${username}:${id}`, JSON.stringify(folder));
		return c.json(folder, 201);
	} catch (err) {
		return c.json({ error: 'Failed to create folder' }, 500);
	}
});

// PATCH /folders/rename/:id — rename a folder
router.patch('/rename/:id', async (c) => {
	try {
		const { username } = c.get('user');
		const config = getConfig(c.env);
		const id = c.req.param('id');
		const { newName } = await c.req.json();

		if (!newName || newName.includes('/') || newName.includes('..')) {
			return c.json({ error: 'Invalid folder name' }, 400);
		}

		const kvKey = `folder:${username}:${id}`;
		const folder = await config.kv.fileMeta.get(kvKey, 'json');
		if (!folder) return c.json({ error: 'Folder not found' }, 404);

		const updated = { ...folder, name: newName };
		await config.kv.fileMeta.put(kvKey, JSON.stringify(updated));
		return c.json(updated);
	} catch (err) {
		return c.json({ error: 'Failed to rename folder' }, 500);
	}
});

// PATCH /folders/trash/:id — move folder to trash
router.patch('/trash/:id', async (c) => {
	try {
		const { username } = c.get('user');
		const config = getConfig(c.env);
		const id = c.req.param('id');
		const kvKey = `folder:${username}:${id}`;
		const folder = await config.kv.fileMeta.get(kvKey, 'json');
		if (!folder) return c.json({ error: 'Folder not found' }, 404);

		const updated = { ...folder, trashed: true, trashedAt: new Date().toISOString() };
		await config.kv.fileMeta.put(kvKey, JSON.stringify(updated));
		return c.json({ success: true });
	} catch (err) {
		return c.json({ error: 'Failed to trash folder' }, 500);
	}
});

// PATCH /folders/restore/:id — restore folder from trash
router.patch('/restore/:id', async (c) => {
	try {
		const { username } = c.get('user');
		const config = getConfig(c.env);
		const id = c.req.param('id');
		const kvKey = `folder:${username}:${id}`;
		const folder = await config.kv.fileMeta.get(kvKey, 'json');
		if (!folder) return c.json({ error: 'Folder not found' }, 404);

		const { trashedAt, ...rest } = folder;
		await config.kv.fileMeta.put(kvKey, JSON.stringify({ ...rest, trashed: false }));
		return c.json({ success: true });
	} catch (err) {
		return c.json({ error: 'Failed to restore folder' }, 500);
	}
});

// DELETE /folders/:id — permanently delete a folder
router.delete('/:id', async (c) => {
	try {
		const { username } = c.get('user');
		const config = getConfig(c.env);
		const id = c.req.param('id');
		const kvKey = `folder:${username}:${id}`;
		const folder = await config.kv.fileMeta.get(kvKey, 'json');
		if (!folder) return c.json({ error: 'Folder not found' }, 404);

		await config.kv.fileMeta.delete(kvKey);
		return c.json({ success: true });
	} catch (err) {
		return c.json({ error: 'Failed to delete folder' }, 500);
	}
});

export default router;
