export type ApplicationStage =
	| 'applied'
	| 'screening_internal'
	| 'vendor_review'
	| 'interview'
	| 'offered'
	| 'hired'
	| 'rejected'
	| 'withdrawn';

export interface ApplicationDocumentSnapshot {
	documentId: string;
	documentType: string;
	fileName: string;
	fileSize: number;
	verifiedAt: string;
}

export interface ApplicationStatusHistory {
	id: string;
	stage: ApplicationStage;
	actorName: string;
	actorRole: string;
	notes?: string;
	createdAt: string;
}

export interface JobApplication {
	id: string;
	candidateId: string;
	candidateName: string;
	candidateEmail: string;
	candidatePhone: string;
	jobId: string;
	jobSlug: string;
	jobTitle: string;
	vendorId: string;
	vendorName: string;
	vendorLocation: string;
	stage: ApplicationStage;
	coverLetter?: string;
	documents: ApplicationDocumentSnapshot[];
	history: ApplicationStatusHistory[];
	interviewSchedule?: string;
	appliedAt: string;
	updatedAt: string;
}

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
