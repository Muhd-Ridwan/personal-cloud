// src/auth.js

const JWT_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

// Hash password using SHA-256 + salt
export async function hashPassword(password, salt) {
	const encoder = new TextEncoder();
	const data = encoder.encode(salt + password);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate a random salt
export function generateSalt() {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return Array.from(array)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

// Verify password against stored hash
export async function verifyPassword(password, salt, storedHash) {
	const hash = await hashPassword(password, salt);
	return hash === storedHash;
}

// Create JWT token
export async function createJWT(payload, secret) {
	const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
	const body = btoa(
		JSON.stringify({
			...payload,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY,
		}),
	);

	const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

	const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${body}`));

	const sigArray = Array.from(new Uint8Array(signature));
	const sig = btoa(String.fromCharCode(...sigArray));

	return `${header}.${body}.${sig}`;
}

// Verify and decode JWT token
export async function verifyJWT(token, secret) {
	try {
		const [header, body, sig] = token.split('.');

		const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
			'verify',
		]);

		const valid = await crypto.subtle.verify(
			'HMAC',
			key,
			Uint8Array.from(atob(sig), (c) => c.charCodeAt(0)),
			new TextEncoder().encode(`${header}.${body}`),
		);

		if (!valid) return null;

		const payload = JSON.parse(atob(body));

		// Check expiry
		if (payload.exp < Math.floor(Date.now() / 1000)) return null;

		return payload;
	} catch {
		return null;
	}
}
