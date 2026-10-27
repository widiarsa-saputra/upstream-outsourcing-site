import { defineEnvVars } from '@sveltejs/kit/env';
export const variables = defineEnvVars({
	PUBLIC_API_URL: {
		public: true,
		static: true,
		schema: (value) => {
			const url = new URL(value || 'http://localhost:3001/api/v1');
			if (!['http:', 'https:'].includes(url.protocol)) throw new Error('API URL must use HTTP(S)');
			return url.toString().replace(/\/$/, '');
		}
	}
});
