import { expect, test, type Page } from '@playwright/test';
const user = {
	id: 'admin-1',
	name: 'Nadia Putri',
	email: 'admin@example.test',
	role: 'SUPERADMIN',
	permissions: ['admin.overview', 'staff.manage'],
	emailVerified: true,
	sessionId: 'session-1'
};
async function mockApi(page: Page, role = 'SUPERADMIN') {
	let authenticated = false;
	const actor = {
		...user,
		role,
		permissions: role === 'SUPERADMIN' ? user.permissions : ['candidate.self']
	};
	await page.route('**/api/v1/**', async (route) => {
		const path = new URL(route.request().url()).pathname;
		const respond = (body: unknown, status = 200) => route.fulfill({ status, json: body });
		if (path.endsWith('/auth/providers')) return respond({ google: false });
		if (path.endsWith('/auth/refresh'))
			return authenticated
				? respond({ accessToken: 'refreshed-token', expiresIn: 900 })
				: respond({ message: 'Expired' }, 401);
		if (path.endsWith('/auth/login')) {
			authenticated = true;
			return respond({ accessToken: 'test-access-token', expiresIn: 900 });
		}
		if (path.endsWith('/auth/logout')) {
			authenticated = false;
			return respond({ message: 'Keluar' });
		}
		if (path.endsWith('/auth/me')) return respond(actor);
		if (path.endsWith('/admin/overview'))
			return respond({
				candidates: 12,
				vendors: 3,
				staff: 1,
				pendingVendors: 2,
				phase: 'foundation',
				generatedAt: new Date().toISOString()
			});
		if (path.endsWith('/admin/staff')) return respond([{ ...actor, status: 'ACTIVE' }]);
		return respond({ message: 'Not found' }, 404);
	});
}
async function login(page: Page) {
	await page.goto('/login');
	await page.getByLabel('Alamat email').fill(user.email);
	await page.getByLabel('Password', { exact: true }).fill('Test-password-2026!');
	await page.getByRole('button', { name: 'Masuk ke portal' }).click();
}
test('admin uses browser API, persists JWT, survives reload, and clears localStorage at logout', async ({
	page,
	request
}, testInfo) => {
	await mockApi(page);
	const requests: string[] = [];
	page.on('request', (req) => {
		if (req.url().includes('/admin/')) requests.push(req.url());
	});
	const html = await request.get('/admin');
	expect(await html.text()).not.toContain('Orang di balik Upstream.');
	await login(page);
	await expect(page).toHaveURL('/admin');
	await expect(page.getByRole('heading', { name: 'Halo, Nadia.' })).toBeVisible();
	expect(await page.evaluate(() => localStorage.getItem('upstream.access_token'))).toBe(
		'test-access-token'
	);
	expect(requests.some((url) => url.endsWith('/admin/overview'))).toBeTruthy();
	await page.screenshot({ path: testInfo.outputPath('admin-desktop.png'), fullPage: true });
	await page.reload();
	await expect(page.getByRole('heading', { name: 'Halo, Nadia.' })).toBeVisible();
	await page.getByRole('button', { name: 'Keluar ↗' }).click();
	await expect(page).toHaveURL(/\/login/);
	expect(await page.evaluate(() => localStorage.getItem('upstream.access_token'))).toBeNull();
});
test('candidate is redirected away from the admin area', async ({ page }) => {
	await mockApi(page, 'CANDIDATE');
	await login(page);
	await expect(page).toHaveURL('/candidate');
	await page.goto('/admin');
	await expect(page).toHaveURL('/candidate');
	await expect(page.getByRole('heading', { name: /Selamat datang/ })).toBeVisible();
});
test('anonymous direct navigation returns to login without issuing dashboard queries', async ({
	page
}) => {
	await mockApi(page);
	const adminRequests: string[] = [];
	page.on('request', (req) => {
		if (req.url().includes('/api/v1/admin/')) adminRequests.push(req.url());
	});
	await page.goto('/admin');
	await expect(page).toHaveURL(/\/login\?returnTo=%2Fadmin/);
	expect(adminRequests).toHaveLength(0);
});
test('login is usable on a small screen without horizontal overflow', async ({ page }) => {
	await mockApi(page);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/login');
	await expect(page.getByRole('button', { name: 'Masuk ke portal' })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
		true
	);
});
