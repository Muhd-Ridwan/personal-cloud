export function getConfig(env) {
	return {
		jwt: {
			secret: env.JWT_SECRET,
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			redirectUri: env.GOOGLE_REDIRECT_URI,
		},
		frontendUrl: env.FRONTEND_URL || 'http://localhost:5173',
		kv: {
			users: env.USERS,
			requests: env.REQUESTS,
			resetTokens: env.RESET_TOKENS,
			fileMeta: env.FILE_META,
		},
		r2: {
			bucket: env.personal_cloud_files,
		},
		email: {
			resendApiKey: env.RESEND_API_KEY,
			fromAddress: env.FROM_EMAIL,
		},
	};
}
