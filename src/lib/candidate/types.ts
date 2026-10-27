import type { components } from '#lib/api/schema.d.ts';
import type { ApiClient } from '#lib/api/client.ts';

export type CandidateProfile = components['schemas']['CandidateProfileResponse'];
export type CandidateProfileDto = components['schemas']['CandidateProfileDto'];
export type Experience = components['schemas']['ExperienceResponse'];
export type ExperienceInput = components['schemas']['ExperienceInputDto'];
export type Education = components['schemas']['EducationResponse'];
export type EducationInput = components['schemas']['EducationInputDto'];
export type Skill = components['schemas']['SkillResponse'];
export type SkillInput = components['schemas']['SkillInputDto'];
export type CandidateDocument = components['schemas']['CandidateDocumentResponse'];
export type CandidateDocumentType = components['schemas']['CandidateUploadIntentDto']['type'];
export type CandidateUploadIntent = components['schemas']['UploadIntentResponse'];

export type CandidateItem = components['schemas']['CandidateItemResponse'];
export type CandidatePage = components['schemas']['CandidatePageResponse'];
export type CandidateDocumentItem = components['schemas']['CandidateDocumentItemWithCandidateResponse'];
export type CandidateDocumentPage = components['schemas']['CandidateDocumentPageResponse'];
export type CandidateDocumentReview = components['schemas']['CandidateDocumentReviewDto'];

export const candidateDocumentLabels: Record<
	CandidateDocumentType,
	{ label: string; description: string; required: boolean }
> = {
	CV: {
		label: 'Curriculum Vitae (CV) / Resume',
		description: 'Format PDF atau dokumen resmi keahlian maksimal 5 MB.',
		required: true
	},
	KTP: {
		label: 'Kartu Tanda Penduduk (KTP)',
		description: 'Scan/foto identitas jelas (JPG, PNG, atau PDF).',
		required: true
	},
	DIPLOMA: {
		label: 'Ijazah Terakhir',
		description: 'Bukti kelulusan pendidikan formal terakhir.',
		required: true
	},
	TRANSCRIPT: {
		label: 'Transkrip Nilai Akademik',
		description: 'Transkrip nilai resmi sekolah / universitas.',
		required: false
	},
	SKCK: {
		label: 'SKCK (Kepolisian)',
		description: 'Surat catatan kepolisian aktif untuk formasi alih daya khusus.',
		required: false
	},
	CERTIFICATE: {
		label: 'Sertifikasi Profesi / Pelatihan',
		description: 'Sertifikat keahlian teknis atau lisensi resmi.',
		required: false
	},
	PORTFOLIO: {
		label: 'Portofolio Karya',
		description: 'Bukti hasil karya atau dokumentasi proyek.',
		required: false
	}
};

export const candidateDocumentStatusConfig: Record<
	string,
	{ label: string; tone: 'neutral' | 'pending' | 'success' | 'warning' | 'danger' }
> = {
	pending: { label: 'Menunggu review', tone: 'pending' },
	verified: { label: 'Terverifikasi', tone: 'success' },
	revision_required: { label: 'Perlu revisi', tone: 'warning' },
	rejected: { label: 'Ditolak', tone: 'danger' }
};

export async function uploadCandidateDocument(
	api: ApiClient,
	type: CandidateDocumentType,
	file: File
): Promise<CandidateDocument> {
	if (
		file.size > 5242880 ||
		file.size < 1 ||
		!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
	) {
		throw new Error('Pilih PDF, JPG, atau PNG dengan ukuran maksimal 5 MB.');
	}

	const intent = await api.request<CandidateUploadIntent>(
		'/candidate/documents/upload-intents',
		{
			method: 'POST',
			body: JSON.stringify({
				type,
				name: file.name,
				mimeType: file.type,
				size: file.size
			})
		}
	);

	if (intent.uploadUrl) {
		const result = await fetch(intent.uploadUrl, {
			method: 'PUT',
			headers: intent.headers,
			body: file,
			credentials: 'omit',
			signal: AbortSignal.timeout(60000)
		});
		if (!result.ok) {
			throw new Error('Unggah ke storage gagal. Periksa koneksi dan coba kembali.');
		}
	} else {
		await api.request(intent.uploadPath, {
			method: 'PUT',
			anonymous: true,
			headers: intent.headers,
			body: file,
			timeoutMs: 60000
		});
	}

	return api.request<CandidateDocument>(
		'/candidate/documents/' + intent.id + '/complete',
		{ method: 'POST' }
	);
}

export async function downloadCandidateDocument(
	api: ApiClient,
	path: string,
	name: string
): Promise<void> {
	const blob = await api.request<Blob>(path, { responseType: 'blob' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = name;
	document.body.append(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
