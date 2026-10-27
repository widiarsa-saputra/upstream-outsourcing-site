import { expect, test, type Page } from '@playwright/test';
test.skip(
	!process.env.E2E_MARKETPLACE_LIVE,
	'Set E2E_MARKETPLACE_LIVE and dedicated test vendor/admin credentials.'
);
async function login(page: Page, email: string, password: string) {
	await page.goto('/login');
	await page.getByLabel('Alamat email').fill(email);
	await page.getByLabel('Password', { exact: true }).fill(password);
	await page.getByRole('button', { name: 'Masuk ke portal' }).click();
}
test('real vendor onboarding, private legal upload, admin clearance, moderated publication and SSR public jobs', async ({
	browser,
	page,
	request
}, testInfo) => {
	test.setTimeout(120000);
	const vendorEmail = process.env.E2E_VENDOR_EMAIL,
		adminEmail = process.env.E2E_ADMIN_EMAIL,
		password = process.env.E2E_VENDOR_PASSWORD,
		adminPassword = process.env.E2E_ADMIN_PASSWORD;
	if (!vendorEmail || !adminEmail || !password || !adminPassword)
		throw new Error(
			'Dedicated E2E vendor/admin email and passwords are required. Vendor email must be verified.'
		);
	const suffix = Date.now().toString().slice(-7),
		name = 'PT Peluang Nusantara ' + suffix,
		title = 'Operator Logistik ' + suffix;
	const errors: string[] = [];
	page.on('dialog', (dialog) => dialog.accept());
	page.on('pageerror', (error) => errors.push(error.message));
	await login(page, vendorEmail, password);
	await expect(page).toHaveURL('/vendor');
	await expect(page.getByRole('heading', { name: /Kenalkan perusahaan/ })).toBeVisible();
	for (const [label, value] of [
		['Nama perusahaan', name],
		['Industri', 'Logistik'],
		['Kota / lokasi', 'Makassar'],
		[
			'Tentang perusahaan',
			'Perusahaan distribusi dan logistik yang membantu talenta bertumbuh melalui peluang operasional yang bermakna.'
		],
		['Alamat legal perusahaan (privat)', 'Jalan Nusantara Nomor 10, Makassar'],
		['Website (opsional)', 'https://example.com'],
		['Nama PIC', 'PIC Privat QA'],
		['Email PIC (privat)', 'private-qa@example.test'],
		['Telepon PIC (privat)', '081234567890'],
		['Nomor NPWP (privat)', 'QA-PRIVATE-NPWP'],
		['Nomor NIB (privat)', 'QA-PRIVATE-NIB']
	])
		await page.getByLabel(label, { exact: true }).fill(value);
	const saved = page.waitForResponse(
		(response) =>
			response.url().endsWith('/vendor/profile') && response.request().method() === 'PATCH'
	);
	await page.getByRole('button', { name: 'Simpan profil' }).click();
	expect((await saved).status()).toBe(200);
	for (const type of ['NPWP', 'NIB', 'AGREEMENT']) {
		await page.getByLabel('Jenis dokumen').selectOption(type);
		await page.getByLabel('Berkas PDF / JPG / PNG').setInputFiles({
			name: type + '-qa.pdf',
			mimeType: 'application/pdf',
			buffer: Buffer.from('%PDF-1.4\nQA private legal document\n%%EOF')
		});
		const uploaded = page.waitForResponse(
			(response) =>
				response.url().includes('/legal-documents/') && response.url().endsWith('/complete')
		);
		await page.getByRole('button', { name: 'Unggah berkas' }).click();
		expect((await uploaded).status()).toBe(201);
		await expect(page.getByText(type + '-qa.pdf', { exact: false })).toBeVisible();
	}
	const submitted = page.waitForResponse((response) =>
		response.url().endsWith('/vendor/submit-verification')
	);
	await page.getByRole('button', { name: 'Ajukan clearance' }).click();
	expect((await submitted).status()).toBe(201);
	await expect(page.getByText('Menunggu review', { exact: true })).toBeVisible();
	const adminContext = await browser.newContext({ baseURL: process.env.E2E_BASE_URL });
	const admin = await adminContext.newPage();
	admin.on('dialog', (dialog) => dialog.accept());
	await login(admin, adminEmail, adminPassword);
	await expect(admin).toHaveURL('/admin');
	await admin.goto('/admin/vendors?status=pending');
	await admin
		.getByRole('row')
		.filter({ hasText: name })
		.getByRole('link', { name: 'Tinjau' })
		.click();
	await expect(admin.getByRole('heading', { name })).toBeVisible();
	const privateDownload = admin.waitForEvent('download');
	await admin.getByRole('button', { name: 'Unduh ↗' }).first().click();
	expect((await privateDownload).suggestedFilename()).toMatch(/qa\.pdf$/);
	await admin.getByLabel('Alasan / catatan keputusan').fill('Legalitas diperiksa oleh tim QA.');

	const clearance = admin.waitForResponse(
		(response) => response.url().includes('/admin/vendors/') && response.url().endsWith('/reviews')
	);
	await admin.getByRole('button', { name: 'Simpan keputusan' }).click();
	expect((await clearance).status()).toBe(201);
	await page.reload();
	await expect(page.getByText('Disetujui', { exact: true }).first()).toBeVisible();
	await page.goto('/vendor/jobs/new');
	for (const [label, value] of [
		['Nama posisi', title],
		['Industri', 'Logistik'],
		['Lokasi kerja', 'Makassar'],
		[
			'Deskripsi pekerjaan',
			'Mengelola penerimaan barang dan distribusi bersama tim logistik dengan standar operasional yang terukur.'
		],
		['Kualifikasi', 'Teliti, mampu bekerja dalam tim dan memiliki pengalaman operasional.'],
		['Benefit (opsional)', 'Pelatihan dan dukungan kesehatan.'],
		['Gaji minimum (IDR)', '4500000'],
		['Gaji maksimum (IDR)', '6500000'],
		['Jumlah kebutuhan', '2']
	])
		await page.getByLabel(label, { exact: true }).fill(value);
	const created = page.waitForResponse(
		(response) => response.url().endsWith('/vendor/jobs') && response.request().method() === 'POST'
	);
	await page.getByRole('button', { name: 'Simpan sebagai draft' }).click();
	const job = await (await created).json();
	await expect(page.getByRole('heading', { name: title })).toBeVisible();
	const submitJob = page.waitForResponse((response) => response.url().endsWith('/submit'));
	await page.getByRole('button', { name: 'Ajukan moderasi' }).click();
	expect((await submitJob).status()).toBe(201);
	await admin.goto('/admin/jobs?moderationStatus=pending');
	await admin
		.getByRole('row')
		.filter({ hasText: title })
		.getByRole('link', { name: 'Tinjau' })
		.click();
	await expect(admin.getByRole('heading', { name: title })).toBeVisible();

	const moderated = admin.waitForResponse(
		(response) => response.url().includes('/admin/jobs/') && response.url().endsWith('/reviews')
	);
	await admin.getByRole('button', { name: 'Simpan keputusan' }).click();
	expect((await moderated).status()).toBe(201);
	await page.reload();

	const published = page.waitForResponse((response) => response.url().endsWith('/publish'));
	await page.getByRole('button', { name: 'Publikasikan ↗' }).click();
	expect((await published).status()).toBe(201);
	const publicHtml = await request.get('/jobs/' + job.slug);
	expect(publicHtml.status()).toBe(200);
	const html = await publicHtml.text();
	expect(html).toContain(title);
	expect(html).not.toContain('QA-PRIVATE-NPWP');
	expect(html).not.toContain('private-qa@example.test');
	const publicContext = await browser.newContext({
		baseURL: process.env.E2E_BASE_URL,
		javaScriptEnabled: false
	});
	const publicPage = await publicContext.newPage();
	await publicPage.goto('/jobs/' + job.slug);
	await expect(publicPage.getByRole('heading', { name: title })).toBeVisible();
	await publicContext.close();
	const preview = await browser.newContext({
		baseURL: process.env.E2E_BASE_URL,
		viewport: { width: 1440, height: 1000 }
	});
	const publicPreview = await preview.newPage();
	await publicPreview.goto('/jobs?q=' + encodeURIComponent(title));
	await expect(publicPreview.getByRole('heading', { name: title })).toBeVisible();
	await publicPreview.screenshot({
		path: testInfo.outputPath('public-jobs-desktop.png'),
		fullPage: true
	});
	await publicPreview.setViewportSize({ width: 390, height: 844 });
	await publicPreview.reload();
	expect(
		await publicPreview.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
	).toBe(true);
	await publicPreview.screenshot({
		path: testInfo.outputPath('public-jobs-mobile.png'),
		fullPage: true
	});
	await preview.close();
	const paused = page.waitForResponse((response) => response.url().endsWith('/pause'));
	await page.getByRole('button', { name: 'Jeda lowongan' }).click();
	expect((await paused).status()).toBe(201);
	expect((await request.get('/jobs/' + job.slug)).status()).toBe(404);
	expect(errors).toEqual([]);
	await adminContext.close();
});
