import type { JobApplication, ApplicationStage } from './applications.ts';

const APPLICATIONS_KEY = 'upstream.applications_mock';

export function getLocalApplications(): JobApplication[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(APPLICATIONS_KEY);
		if (raw) return JSON.parse(raw);
	} catch {
		// fallback
	}
	const initial = seedInitialApplications();
	saveLocalApplications(initial);
	return initial;
}

export function saveLocalApplications(apps: JobApplication[]): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
}

export function createApplication(app: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt' | 'history'>): JobApplication {
	const current = getLocalApplications();
	const newApp: JobApplication = {
		...app,
		id: crypto.randomUUID(),
		appliedAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		history: [
			{
				id: crypto.randomUUID(),
				stage: 'applied',
				actorName: app.candidateName,
				actorRole: 'CANDIDATE',
				notes: 'Mengirimkan lamaran dan berkas digital.',
				createdAt: new Date().toISOString()
			}
		]
	};
	current.unshift(newApp);
	saveLocalApplications(current);
	return newApp;
}

export function updateApplicationStage(
	appId: string,
	stage: ApplicationStage,
	actorName: string,
	actorRole: string,
	notes?: string,
	interviewSchedule?: string
): JobApplication | null {
	const current = getLocalApplications();
	const index = current.findIndex((a) => a.id === appId);
	if (index === -1) return null;

	const target = current[index];
	target.stage = stage;
	target.updatedAt = new Date().toISOString();
	if (interviewSchedule) target.interviewSchedule = interviewSchedule;

	target.history.unshift({
		id: crypto.randomUUID(),
		stage,
		actorName,
		actorRole,
		notes,
		createdAt: new Date().toISOString()
	});

	current[index] = target;
	saveLocalApplications(current);
	return target;
}

function seedInitialApplications(): JobApplication[] {
	return [
		{
			id: 'app-seed-001',
			candidateId: 'cand-demo-1',
			candidateName: 'Budi Santoso',
			candidateEmail: 'budi.santoso@example.com',
			candidatePhone: '08123456789',
			jobId: 'job-1',
			jobSlug: 'staff-gudang-logistik-denpasar',
			jobTitle: 'Staf Gudang & Logistik',
			vendorId: 'vendor-1',
			vendorName: 'PT Mitra Logistik Nusantara',
			vendorLocation: 'Denpasar, Bali',
			stage: 'screening_internal',
			coverLetter: 'Saya memiliki pengalaman 2 tahun di bidang warehouse operator dan siap bekerja on-site.',
			documents: [
				{
					documentId: 'doc-1',
					documentType: 'KTP',
					fileName: 'ktp_budi.pdf',
					fileSize: 1200000,
					verifiedAt: new Date().toISOString()
				},
				{
					documentId: 'doc-2',
					documentType: 'CV',
					fileName: 'cv_budi_logistik.pdf',
					fileSize: 950000,
					verifiedAt: new Date().toISOString()
				}
			],
			history: [
				{
					id: 'hist-2',
					stage: 'screening_internal',
					actorName: 'Talent Acquisition Team',
					actorRole: 'TALENT_ACQUISITION',
					notes: 'Memeriksa berkas KTP dan sertifikat K3.',
					createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
				},
				{
					id: 'hist-1',
					stage: 'applied',
					actorName: 'Budi Santoso',
					actorRole: 'CANDIDATE',
					notes: 'Lamaran diserahkan.',
					createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
				}
			],
			appliedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
			updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
		}
	];
}
