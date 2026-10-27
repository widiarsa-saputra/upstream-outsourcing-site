import { expect, test } from '@playwright/test';
test.skip(
	!process.env.E2E_LIVE,
	'Set E2E_LIVE=1 and E2E_ADMIN_EMAIL/PASSWORD for the real API smoke test.'
);
test('real Nest API: login, localStorage JWT, CSR data, refresh, cross-tab logout', async ({
	page,
	context,
	request
}) => {
	const email = process.env.E2E_ADMIN_EMAIL,
		password = process.env.E2E_ADMIN_PASSWORD;
	if (!email || !password) throw new Error('E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required');
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	const html = await request.get('/admin');
	expect(await html.text()).not.toContain('Orang di balik Upstream.');
	await page.goto('/login');
	await page.getByLabel('Alamat email').fill(email);
	await page.getByLabel('Password', { exact: true }).fill(password);
	const overview = page.waitForResponse((response) =>
		response.url().endsWith('/api/v1/admin/overview')
	);
	await page.getByRole('button', { name: 'Masuk ke portal' }).click();
	await expect(page).toHaveURL('/admin');
	expect((await overview).status()).toBe(200);
	expect(await page.evaluate(() => localStorage.getItem('upstream.access_token'))).toMatch(/^eyJ/);
	await page.reload();
	await expect(page.getByRole('heading', { name: /Halo,/ })).toBeVisible();
	// Drop only the access token; the HttpOnly refresh cookie must recover the session.
	await page.evaluate(() => localStorage.removeItem('upstream.access_token'));
	const refreshed = page.waitForResponse((response) => response.url().endsWith('/auth/refresh'));
	await page.reload();
	expect((await refreshed).status()).toBe(201);
	await expect(page.getByRole('heading', { name: /Halo,/ })).toBeVisible();
	const second = await context.newPage();
	await second.goto('/admin');
	await expect(second.getByRole('heading', { name: /Halo,/ })).toBeVisible();
	await page.getByRole('button', { name: 'Keluar ↗' }).click();
	await expect(page).toHaveURL(/\/login/);
	await expect(second).toHaveURL(/\/login/);
	expect(await page.evaluate(() => localStorage.getItem('upstream.access_token'))).toBeNull();
	expect(errors).toEqual([]);
});
