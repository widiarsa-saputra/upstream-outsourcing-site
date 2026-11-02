import type { PageServerLoad } from './$types';
import { publicApi, publicFilters } from '#lib/server/public-api.ts';
import type { PublicJobPage, PublicJob } from '#lib/marketplace/types.ts';

const FALLBACK_JOBS: (PublicJob & { organizerType?: string; degree?: string; interviewType?: string })[] = [
	{
		id: 'job-1',
		slug: 'staf-administrasi-pelayanan-publik',
		title: 'Staf Administrasi & Tata Kelola Operasional',
		description: 'Mendukung koordinasi dokumentasi kepatuhan operasional dan clearance administrasi layanan publik.',
		qualifications: 'Pendidikan minimal Diploma atau Sarjana segala jurusan, teliti, menguasai office suite.',
		benefits: 'BPJS Kesehatan & Ketenagakerjaan, Tunjangan Kinerja, Pelatihan Profesional.',
		requirements: [
			{ code: 'KTP', name: 'Kartu Tanda Penduduk (KTP)', required: true },
			{ code: 'IJAZAH', name: 'Ijazah Terakhir', required: true }
		],
		location: 'Kab Timor Tengah Selatan',
		industry: 'Administrasi Bisnis',
		employmentType: 'FULL_TIME',
		workMode: 'ONSITE',
		salaryMin: 4500000,
		salaryMax: 6000000,
		salaryPeriod: 'MONTH',
		currency: 'IDR',
		salaryVisible: true,
		openings: 3,
		deadline: '2026-12-31',
		publishedAt: '2026-10-15',
		organizerType: 'kementerian',
		degree: 'diploma',
		interviewType: 'onsite',
		vendor: {
			id: 'v-1',
			name: 'Kementerian Koordinator Bidang Pemberdayaan',
			slug: 'kemenko-pemberdayaan',
			description: 'Instansi pemerintah yang menaungi program pemberdayaan dan alih daya tenaga kerja nasional.',
			industry: 'Pemerintahan',
			location: 'Kab Timor Tengah Selatan',
			website: 'https://pemberdayaan.go.id',
			activeJobCount: 1
		}
	},
	{
		id: 'job-2',
		slug: 'software-engineer-frontend',
		title: 'Frontend Web Application Specialist',
		description: 'Pengembangan modul antarmuka publik dan integrasi sistem karir terpusat.',
		qualifications: 'Sarjana Teknik Informatika / Ilmu Komputer, terbiasa dengan Svelte/TypeScript.',
		benefits: 'Laptop kerja, tunjangan internet, asuransi kesehatan swasta.',
		requirements: [
			{ code: 'CV', name: 'Curriculum Vitae', required: true },
			{ code: 'PORTFOLIO', name: 'Portofolio Proyek', required: true }
		],
		location: 'Kab. Aceh Barat',
		industry: 'Teknologi Informasi',
		employmentType: 'FULL_TIME',
		workMode: 'REMOTE',
		salaryMin: 8500000,
		salaryMax: 12000000,
		salaryPeriod: 'MONTH',
		currency: 'IDR',
		salaryVisible: true,
		openings: 2,
		deadline: '2026-12-31',
		publishedAt: '2026-10-20',
		organizerType: 'perusahaan',
		degree: 'sarjana',
		interviewType: 'online',
		vendor: {
			id: 'v-2',
			name: 'PT Mitra Solusi Digital Nusantara',
			slug: 'mitra-solusi-digital',
			description: 'Penyedia solusi IT dan transformasi digital terkemuka.',
			industry: 'Teknologi Informasi',
			location: 'Kab. Aceh Barat',
			website: 'https://mitradigital.co.id',
			activeJobCount: 1
		}
	},
	{
		id: 'job-3',
		slug: 'analis-logistik-rantai-pasok',
		title: 'Supervisor Distribusi & Rantai Pasok',
		description: 'Perencanaan rute pasokan, audit pengiriman logistik, dan pelaporan pergerakan armada antar-kabupaten.',
		qualifications: 'Sarjana Logistik, Teknik Industri, atau Manajemen Operasional.',
		benefits: 'Tunjangan operasional harian, BPJS, bonus pencapaian kuartalan.',
		requirements: [
			{ code: 'CV', name: 'Curriculum Vitae', required: true },
			{ code: 'SIM_A', name: 'Surat Izin Mengemudi (SIM A/B)', required: true }
		],
		location: 'Kab. Aceh Barat Daya',
		industry: 'Logistik',
		employmentType: 'CONTRACT',
		workMode: 'ONSITE',
		salaryMin: 6000000,
		salaryMax: 7800000,
		salaryPeriod: 'MONTH',
		currency: 'IDR',
		salaryVisible: true,
		openings: 4,
		deadline: '2026-11-30',
		publishedAt: '2026-10-22',
		organizerType: 'perusahaan',
		degree: 'sarjana',
		interviewType: 'onsite',
		vendor: {
			id: 'v-3',
			name: 'PT Logistik Nusantara Cemerlang',
			slug: 'logistik-nusantara',
			description: 'Jaringan distribusi logistik nasional terintegrasi.',
			industry: 'Logistik',
			location: 'Kab. Aceh Barat Daya',
			website: 'https://logistiknusantara.co.id',
			activeJobCount: 1
		}
	},
	{
		id: 'job-4',
		slug: 'tenaga-ahli-profesi-kesehatan-keselamatan',
		title: 'Tenaga Ahli K3 & Standarisasi Kerja',
		description: 'Memastikan standar keselamatan kerja pada area fasilitas mitra kementerian dan operasional lapangan.',
		qualifications: 'Pendidikan Profesi / Sertifikasi Ahli K3 Umum resmi.',
		benefits: 'Rumah dinas / tunjangan akomodasi, asuransi komprehensif, jenjang karier ASN/P3K terarah.',
		requirements: [
			{ code: 'SERTIFIKAT_K3', name: 'Sertifikat Ahli K3 Umum Kemenaker', required: true },
			{ code: 'IJAZAH_PROFESI', name: 'Ijazah Profesi', required: true }
		],
		location: 'Kab. Aceh Besar',
		industry: 'Manufaktur',
		employmentType: 'FULL_TIME',
		workMode: 'ONSITE',
		salaryMin: 9000000,
		salaryMax: 14000000,
		salaryPeriod: 'MONTH',
		currency: 'IDR',
		salaryVisible: true,
		openings: 1,
		deadline: '2026-12-15',
		publishedAt: '2026-10-25',
		organizerType: 'kementerian',
		degree: 'profesi',
		interviewType: 'onsite',
		vendor: {
			id: 'v-4',
			name: 'Kementerian Ketenagakerjaan Balai Regional',
			slug: 'kemnaker-regional',
			description: 'Balai Keselamatan dan Kesehatan Kerja Regional Kemenaker RI.',
			industry: 'Pemerintahan',
			location: 'Kab. Aceh Besar',
			website: 'https://kemnaker.go.id',
			activeJobCount: 1
		}
	},
	{
		id: 'job-5',
		slug: 'study-abroad-global-trainee-japan',
		title: 'Global Trainee & Overseas Internship (Japan)',
		description: 'Program akselerasi magang dan studi internasional di prefektur mitra industri Jepang.',
		qualifications: 'Diploma / Sarjana, kemauan belajar bahasa asing, lolos asesmen awal.',
		benefits: 'Tiket penerbangan, visa magang resmi, akomodasi asrama, asuransi kesehatan Jepang.',
		requirements: [
			{ code: 'PASSPORT', name: 'Paspor Aktif / KTP', required: true },
			{ code: 'TRANSKRIP', name: 'Transkrip Nilai Akademik', required: true }
		],
		location: 'Kab Timor Tengah Selatan',
		industry: 'Layanan & Perhotelan',
		employmentType: 'INTERNSHIP',
		workMode: 'ONSITE',
		salaryMin: 15000000,
		salaryMax: 22000000,
		salaryPeriod: 'MONTH',
		currency: 'JPY_EQ_IDR',
		salaryVisible: true,
		openings: 10,
		deadline: '2026-12-31',
		publishedAt: '2026-10-28',
		organizerType: 'perusahaan',
		degree: 'sarjana',
		interviewType: 'onsite',
		vendor: {
			id: 'v-5',
			name: 'Go Career Global Mobility Center',
			slug: 'go-career-global',
			description: 'Pusat pengembangan karier global dan mobilitas talenta internasional.',
			industry: 'Pendidikan & Pelatihan',
			location: 'Kab Timor Tengah Selatan',
			website: 'https://gocareer.id',
			activeJobCount: 1
		}
	}
];

export const load: PageServerLoad = async ({ fetch, url, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });
	const filters = publicFilters(url.searchParams, 'jobs');
	const filterObj = Object.fromEntries(filters);

	try {
		const jobs = await publicApi<PublicJobPage>(fetch, '/jobs?' + filters);
		if (jobs.items.length > 0) {
			return {
				jobs,
				filters: filterObj
			};
		}
	} catch {
		// Fallback to sample data when local backend service is offline
	}

	// Filter fallback mock data
	let filtered = FALLBACK_JOBS;
	const q = filterObj.q?.toLowerCase();
	const organizer = filterObj.organizerType?.toLowerCase();
	const degree = filterObj.degree?.toLowerCase();
	const interview = filterObj.interviewType?.toLowerCase();
	const location = filterObj.location?.toLowerCase();
	const type = filterObj.type?.toLowerCase();

	if (q) {
		filtered = filtered.filter(
			(j) =>
				j.title.toLowerCase().includes(q) ||
				j.description.toLowerCase().includes(q) ||
				j.vendor.name.toLowerCase().includes(q)
		);
	}
	if (organizer) {
		filtered = filtered.filter((j) => j.organizerType === organizer);
	}
	if (degree) {
		filtered = filtered.filter((j) => j.degree === degree);
	}
	if (interview) {
		filtered = filtered.filter((j) => j.interviewType === interview);
	}
	if (location) {
		filtered = filtered.filter((j) => j.location.toLowerCase().includes(location));
	}
	if (type === 'study-abroad') {
		filtered = filtered.filter((j) => j.slug.includes('study-abroad') || j.title.toLowerCase().includes('global'));
	}

	return {
		jobs: {
			items: filtered,
			total: filtered.length,
			page: 1,
			pageSize: 12,
			totalPages: 1
		} as PublicJobPage,
		filters: filterObj
	};
};
