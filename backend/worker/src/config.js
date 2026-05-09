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
		kv: {
			users: env.USERS,
			requests: env.REQUESTS,
			resetTokens: env.RESET_TOKENS,
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
