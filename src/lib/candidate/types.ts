export interface CandidateBio {
	headline: string;
	phone: string;
	location: string;
	bio: string;
	linkedinUrl?: string;
	portfolioUrl?: string;
}

export interface WorkExperience {
	id: string;
	company: string;
	position: string;
	location?: string;
	startDate: string; // YYYY-MM
	endDate?: string;   // YYYY-MM or null if current
	isCurrent: boolean;
	description: string;
}

export interface Education {
	id: string;
	institution: string;
	degree: string;
	fieldOfStudy: string;
	startDate: string; // YYYY
	endDate?: string;   // YYYY
	grade?: string;
}

export interface SkillItem {
	id: string;
	name: string;
	level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

export interface CandidateProfile {
	userId: string;
	headline: string;
	phone: string;
	location: string;
	bio: string;
	linkedinUrl: string;
	portfolioUrl: string;
	experiences: WorkExperience[];
	educations: Education[];
	skills: SkillItem[];
	updatedAt: string;
}

export type DocumentType = 'RESUME' | 'ID_CARD' | 'DIPLOMA' | 'TRANSCRIPT' | 'CERTIFICATE' | 'SKCK' | 'OTHER';

export type DocumentStatus = 'draft' | 'pending_review' | 'verified' | 'revision_required' | 'rejected';

export interface CandidateDocument {
	id: string;
	type: DocumentType;
	title: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
	status: DocumentStatus;
	reviewNotes?: string;
	uploadedAt: string;
	verifiedAt?: string;
}

export const documentTypeLabels: Record<DocumentType, { label: string; description: string; required: boolean }> = {
	RESUME: {
		label: 'Curriculum Vitae (CV) / Resume',
		description: 'Format PDF wajib, terbaru maksimal 5 MB.',
		required: true
	},
	ID_CARD: {
		label: 'Kartu Tanda Penduduk (KTP)',
		description: 'Scan/foto jelas berformat JPG, PNG, atau PDF.',
		required: true
	},
	DIPLOMA: {
		label: 'Ijazah Terakhir',
		description: 'Bukti kelulusan pendidikan formal.',
		required: true
	},
	TRANSCRIPT: {
		label: 'Transkrip Nilai',
		description: 'Transkrip akademik resmi.',
		required: false
	},
	SKCK: {
		label: 'SKCK (Surat Keterangan Catatan Kepolisian)',
		description: 'Diperlukan untuk formasi alih daya tertentu.',
		required: false
	},
	CERTIFICATE: {
		label: 'Sertifikat Keahlian / Pelatihan',
		description: 'Sertifikasi kompetensi atau lisensi profesional.',
		required: false
	},
	OTHER: {
		label: 'Dokumen Tambahan',
		description: 'Portofolio kerja, surat referensi, dll.',
		required: false
	}
};

export const documentStatusConfig: Record<DocumentStatus, { label: string; tone: 'neutral' | 'pending' | 'success' | 'warning' | 'danger' }> = {
	draft: { label: 'Draft', tone: 'neutral' },
	pending_review: { label: 'Menunggu verifikasi', tone: 'pending' },
	verified: { label: 'Terverifikasi', tone: 'success' },
	revision_required: { label: 'Perlu revisi', tone: 'warning' },
	rejected: { label: 'Ditolak', tone: 'danger' }
};
