import { defineConfig } from '@playwright/test';
export default defineConfig({
	use: { baseURL: process.env.E2E_BASE_URL || 'http://localhost:4173', trace: 'retain-on-failure' },
	webServer: process.env.E2E_BASE_URL
		? undefined
		: [
				{
					command: 'node tests/fixtures/public-api.mjs',
					url: 'http://127.0.0.1:3101/health',
					reuseExistingServer: false
				},
				{
					env: { PUBLIC_API_URL: 'http://127.0.0.1:3101/api/v1' },
					command: 'npm run build && npm run preview -- --host 127.0.0.1',
					port: 4173,
					timeout: 120000
				}
			],
	testMatch: '**/*.e2e.{ts,js}',
	workers: 1
});
