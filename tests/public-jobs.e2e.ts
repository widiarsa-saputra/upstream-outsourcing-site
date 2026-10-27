import { expect, test } from '@playwright/test';
test.skip(
	!!process.env.E2E_BASE_URL,
	'Public fixture suite uses the isolated API started by the default Playwright config.'
);
test('public jobs and detail are SSR HTML and work without JavaScript', async ({
	browser,
	request
}, testInfo) => {
	const response = await request.get('/jobs?q=Operator');
	expect(response.status()).toBe(200);
	const html = await response.text();
	expect(html).toContain('Operator Gudang');
	expect(html).not.toContain('Admin Distribusi');
	const context = await browser.newContext({
		baseURL: testInfo.project.use.baseURL,
		javaScriptEnabled: false
	});
	const page = await context.newPage();
	await page.goto('/jobs/operator-gudang');
	await expect(page.getByRole('heading', { name: 'Operator Gudang', exact: true })).toBeVisible();
	await expect(page.getByText('CV / Resume')).toBeVisible();
	await context.close();
});
test('public filters, vendor directory and missing jobs have usable navigation', async ({
	page,
	request
}) => {
	await page.goto('/jobs');
	await page.getByLabel('Posisi atau keahlian').fill('Operator');
	await page.getByRole('button', { name: 'Cari peluang' }).click();
	await expect(page.getByRole('heading', { name: 'Operator Gudang', exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Admin Distribusi', exact: true })).toHaveCount(0);
	await page.goto('/vendors/nusantara-logistics');
	await expect(
		page.getByRole('heading', { name: 'Nusantara Logistics', exact: true })
	).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Operator Gudang', exact: true })).toBeVisible();
	expect((await request.get('/jobs/unpublished-draft')).status()).toBe(404);
});
test('public job search and detail fit a mobile viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	for (const path of ['/jobs', '/jobs/operator-gudang', '/vendors/nusantara-logistics']) {
		await page.goto(path);
		await expect(page.locator('h1')).toBeVisible();
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
	}
});
