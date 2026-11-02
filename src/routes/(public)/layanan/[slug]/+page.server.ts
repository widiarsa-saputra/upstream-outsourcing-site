import type { PageServerLoad } from './$types';
import { publicApi } from '#lib/server/public-api.ts';
import type { PublicJob } from '#lib/marketplace/types.ts';

export const load: PageServerLoad = async ({ fetch, params, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });
	try {
		return { job: await publicApi<PublicJob>(fetch, '/jobs/' + encodeURIComponent(params.slug)) };
	} catch {
		return {
			job: {
				id: 'demo-program',
				slug: params.slug,
				title: 'Program Pelatihan & Penempatan Kerja ' + params.slug.replace(/-/g, ' ').toUpperCase(),
				industry: 'Teknologi Informasi',
				employmentType: 'CONTRACT',
				workMode: 'HYBRID',
				location: 'Denpasar, Bali',
				openings: 5,
				deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
				salaryVisible: true,
				salaryMin: 5000000,
				salaryMax: 8000000,
				salaryPeriod: 'MONTH',
				description:
					'Program kerja alih daya terverifikasi dengan bimbingan fase bertahap dan kontrak legalitas resmi.',
				qualifications:
					'Pendidikan minimal SMK/D3/S1, memiliki motivasi tinggi, dan dokumen terverifikasi di Document Vault.',
				benefits: 'Gaji pokok, tunjangan kesehatan BPJS, pendampingan karier, dan sertifikasi kompetensi.',
				requirements: [
					{ code: 'CV', name: 'Curriculum Vitae (CV) PDF', required: true },
					{ code: 'KTP', name: 'Kartu Tanda Penduduk (KTP)', required: true }
				],
				vendor: {
					id: 'demo-vendor',
					name: 'Mitra PT Go Career Solusindo',
					slug: 'go-career-solusindo'
				}
			} as unknown as PublicJob
		};
	}
};
