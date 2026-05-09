// src/r2.js

// List all files for a specific user
export async function listUserFiles(bucket, username) {
	const prefix = `users/${username}/`;
	const listed = await bucket.list({ prefix });

	return listed.objects.map((obj) => ({
		key: obj.key,
		name: obj.key.replace(prefix, ''), // strip the users/username/ prefix
		size: obj.size,
		updatedAt: obj.uploaded,
		type: getFileType(obj.key),
	}));
}

// Upload a file directly
export async function uploadFile(bucket, username, filename, data, contentType) {
	const key = `users/${username}/${filename}`;
	await bucket.put(key, data, {
		httpMetadata: { contentType },
	});
	return key;
}

// Delete a file — only if it belongs to the user
export async function deleteFile(bucket, username, key) {
	// Security check — make sure user can only delete their own files
	if (!key.startsWith(`users/${username}/`)) {
		throw new Error("Unauthorized — cannot delete another user's file");
	}
	await bucket.delete(key);
}

// Get a file — only if it belongs to the user
export async function getFile(bucket, username, key) {
	if (!key.startsWith(`users/${username}/`)) {
		throw new Error("Unauthorized — cannot access another user's file");
	}
	return await bucket.get(key);
}

// Helper — detect file type from extension
function getFileType(key) {
	const ext = key.split('.').pop().toLowerCase();
	const map = {
		pdf: 'pdf',
		jpg: 'image',
		jpeg: 'image',
		png: 'image',
		gif: 'image',
		webp: 'image',
		mp4: 'video',
		mov: 'video',
		avi: 'video',
		mkv: 'video',
		doc: 'docx',
		docx: 'docx',
		xls: 'xlsx',
		xlsx: 'xlsx',
		zip: 'zip',
		rar: 'zip',
		txt: 'txt',
		md: 'txt',
	};
	return map[ext] || 'unknown';
}
