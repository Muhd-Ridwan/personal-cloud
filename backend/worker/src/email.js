export async function sendResetEmail(to, resetLink, apiKey, fromAddress) {
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: fromAddress,
			to,
			subject: 'Reset your password',
			html: `
                <p>You requested a password reset.</p>
                <p><a href="${resetLink}">Click here to reset your password</a></p>
                <p>This link expires in 1 hour.</p>
                <p>If you did not request this, ignore this email.</p>
            `,
		}),
	});

	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.message || 'Failed to send email');
	}
}
