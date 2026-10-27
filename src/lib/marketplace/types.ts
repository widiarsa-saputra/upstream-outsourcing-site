import type { components } from '#lib/api/schema.d.ts';
export type Vendor = components['schemas']['VendorResponse'];
export type Job = components['schemas']['JobResponse'];
export type PublicJob = components['schemas']['PublicJobResponse'];
export type PublicVendor = components['schemas']['PublicVendorResponse'];
export type JobPage = components['schemas']['JobPageResponse'];
export type VendorPage = components['schemas']['VendorPageResponse'];
export type PublicJobPage = components['schemas']['PublicJobPageResponse'];
export type PublicVendorPage = components['schemas']['PublicVendorPageResponse'];
export type JobInput = components['schemas']['JobInputDto'];
export type VendorInput = components['schemas']['VendorProfileDto'];
export type UploadIntent = components['schemas']['UploadIntentResponse'];
export const statusLabel: Record<string, string> = {
	draft: 'Draft',
	pending: 'Menunggu review',
	approved: 'Disetujui',
	revision_required: 'Perlu revisi',
	rejected: 'Ditolak',
	suspended: 'Ditangguhkan',
	published: 'Tayang',
	unpublished: 'Belum tayang',
	paused: 'Dijeda',
	closed: 'Ditutup',
	ready: 'Siap diperiksa',
	NPWP: 'NPWP',
	NIB: 'NIB',
	AGREEMENT: 'Perjanjian kerja sama',
	ONSITE: 'On-site',
	REMOTE: 'Remote',
	HYBRID: 'Hybrid',
	FULL_TIME: 'Full time',
	CONTRACT: 'Kontrak',
	PART_TIME: 'Paruh waktu',
	INTERNSHIP: 'Magang'
};
export const dateLabel = (value: string | null) =>
	value
		? new Date(value).toLocaleDateString('id-ID', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			})
		: 'Tanpa batas tanggal';
export function salaryLabel(
	job: Pick<PublicJob, 'salaryVisible' | 'salaryMin' | 'salaryMax' | 'salaryPeriod'>
) {
	if (!job.salaryVisible || job.salaryMin === null || job.salaryMax === null)
		return 'Gaji dibahas saat seleksi';
	const money = new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		maximumFractionDigits: 0
	});
	return `${money.format(job.salaryMin)} – ${money.format(job.salaryMax)} / ${job.salaryPeriod === 'DAY' ? 'hari' : 'bulan'}`;
}

export function witaDateInput(value?: string) {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Makassar',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(value ? new Date(value) : new Date());
}
