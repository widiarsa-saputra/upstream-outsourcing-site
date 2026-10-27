import { createServer } from 'node:http';
const vendor = {
	id: 'public-vendor-1',
	slug: 'nusantara-logistics',
	name: 'Nusantara Logistics',
	description:
		'Mitra logistik terverifikasi yang membuka peluang untuk tumbuh bersama tim distribusi di seluruh Indonesia.',
	industry: 'Logistik',
	location: 'Makassar',
	website: 'https://example.com',
	activeJobCount: 2
};
const base = {
	id: 'public-job-1',
	slug: 'operator-gudang',
	title: 'Operator Gudang',
	description:
		'Mengelola penerimaan dan distribusi barang bersama tim operasional gudang di Makassar.',
	qualifications: 'Teliti, bertanggung jawab dan mampu bekerja bersama tim.',
	benefits: 'Pelatihan dan dukungan kesehatan.',
	industry: 'Logistik',
	location: 'Makassar',
	workMode: 'ONSITE',
	employmentType: 'CONTRACT',
	salaryMin: 4500000,
	salaryMax: 6000000,
	salaryVisible: true,
	salaryPeriod: 'MONTH',
	currency: 'IDR',
	openings: 3,
	deadline: null,
	publishedAt: '2026-10-27T00:00:00.000Z',
	vendor,
	requirements: [{ code: 'CV', name: 'CV / Resume', required: true }]
};
const jobs = [
	base,
	{
		...base,
		id: 'public-job-2',
		slug: 'admin-distribusi',
		title: 'Admin Distribusi',
		location: 'Denpasar',
		workMode: 'HYBRID'
	}
];
/** @template T @param {T[]} items @param {URLSearchParams} params */
const paginate = (items, params) => {
	const page = Number(params.get('page') || 1),
		pageSize = Number(params.get('pageSize') || 12);
	return {
		items: items.slice((page - 1) * pageSize, page * pageSize),
		total: items.length,
		page,
		pageSize,
		totalPages: Math.ceil(items.length / pageSize)
	};
};
const server = createServer((req, res) => {
	const url = new URL(req.url || '/', 'http://127.0.0.1');
	const path = url.pathname;
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-store');
	let data;
	if (path === '/health') data = { status: 'ready' };
	else if (path === '/api/v1/public/jobs') {
		const list = jobs.filter(
			(j) =>
				(!url.searchParams.get('q') ||
					j.title.toLowerCase().includes((url.searchParams.get('q') || '').toLowerCase())) &&
				(!url.searchParams.get('location') ||
					j.location
						.toLowerCase()
						.includes((url.searchParams.get('location') || '').toLowerCase())) &&
				(!url.searchParams.get('workMode') || j.workMode === url.searchParams.get('workMode')) &&
				(!url.searchParams.get('vendorSlug') ||
					j.vendor.slug === url.searchParams.get('vendorSlug'))
		);
		data = paginate(list, url.searchParams);
	} else if (path === '/api/v1/public/vendors') data = paginate([vendor], url.searchParams);
	else if (path === '/api/v1/public/vendors/' + vendor.slug) data = vendor;
	else data = jobs.find((j) => path === '/api/v1/public/jobs/' + j.slug);
	if (!data) {
		res.statusCode = 404;
		data = { message: 'Not found' };
	}
	res.end(JSON.stringify(data));
});
server.listen(3101, '127.0.0.1');
for (const signal of ['SIGTERM', 'SIGINT'])
	process.on(signal, () => server.close(() => process.exit(0)));
