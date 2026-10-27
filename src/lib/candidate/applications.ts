import type { components } from '#lib/api/schema.d.ts';

export type Application = components['schemas']['ApplicationResponse'];
export type ApplicationPage = components['schemas']['ApplicationPageResponse'];
export type ApplicationStage = components['schemas']['ApplicationResponse']['stage'];
export type ApplicationTransition = components['schemas']['ApplicationTransitionDto'];
export type CreateApplication = components['schemas']['CreateApplicationDto'];
export type InternalNote = components['schemas']['InternalNoteResponse'];
export type ApplicationEvent = components['schemas']['ApplicationEventResponse'];
export type ApplicationDocumentSnapshot = components['schemas']['ApplicationDocumentSnapshotResponse'];

export const applicationStageConfig: Record<
	ApplicationStage,
	{ label: string; description: string; tone: 'neutral' | 'pending' | 'info' | 'success' | 'danger' }
> = {
	applied: {
		label: 'Lamaran Terkirim',
		description: 'Lamaran Anda telah diterima oleh sistem Upstream.',
		tone: 'info'
	},
	screening_internal: {
		label: 'Kurasi Tim Staf Internal',
		description: 'Dokumen dan kualifikasi sedang divalidasi oleh tim Talent Acquisition.',
		tone: 'pending'
	},
	vendor_review: {
		label: 'Ditinjau Mitra Usaha',
		description: 'Kandidat terkurasi diteruskan ke perusahaan mitra penyedia kerja.',
		tone: 'info'
	},
	interview: {
		label: 'Wawancara Terjadwal',
		description: 'Mitra perusahaan mengundang Anda untuk sesi wawancara kerja.',
		tone: 'pending'
	},
	offered: {
		label: 'Penawaran Kerja (Offering)',
		description: 'Mitra perusahaan memberikan surat penawaran kerja alih daya.',
		tone: 'success'
	},
	hired: {
		label: 'Diterima / Siap Penempatan',
		description: 'Selamat! Anda telah lolos dan masuk tahap onboarding penempatan kerja.',
		tone: 'success'
	},
	rejected: {
		label: 'Belum Sesuai',
		description: 'Kualifikasi belum sesuai dengan kebutuhan formasi saat ini.',
		tone: 'danger'
	},
	withdrawn: {
		label: 'Dibatalkan Pelamar',
		description: 'Lamaran dibatalkan secara mandiri oleh kandidat.',
		tone: 'neutral'
	}
};
