import type { CandidateProfile, CandidateDocument } from './types.ts';

const PROFILE_STORAGE_KEY = 'upstream.candidate.profile_mock';
const DOCUMENTS_STORAGE_KEY = 'upstream.candidate.documents_mock';

export function getLocalCandidateProfile(userId: string): CandidateProfile {
	if (typeof window === 'undefined') {
		return createDefaultProfile(userId);
	}
	try {
		const raw = localStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`);
		if (raw) return JSON.parse(raw);
	} catch {
		// fallback to default
	}
	const initial = createDefaultProfile(userId);
	saveLocalCandidateProfile(userId, initial);
	return initial;
}

export function saveLocalCandidateProfile(userId: string, profile: CandidateProfile): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(`${PROFILE_STORAGE_KEY}_${userId}`, JSON.stringify(profile));
}

export function getLocalCandidateDocuments(userId: string): CandidateDocument[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(`${DOCUMENTS_STORAGE_KEY}_${userId}`);
		if (raw) return JSON.parse(raw);
	} catch {
		// fallback
	}
	return [];
}

export function saveLocalCandidateDocuments(userId: string, docs: CandidateDocument[]): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(`${DOCUMENTS_STORAGE_KEY}_${userId}`, JSON.stringify(docs));
}

function createDefaultProfile(userId: string): CandidateProfile {
	return {
		id: crypto.randomUUID(),
		userId,
		email: '',
		name: '',
		headline: '',
		phone: '',
		location: '',
		address: '',
		gender: '',
		bio: '',
		version: 1,
		experiences: [],
		educations: [],
		skills: [],
		documents: [],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};
}
