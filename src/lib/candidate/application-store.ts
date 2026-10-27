import type { Application, ApplicationStage } from './applications.ts';

const APPLICATIONS_KEY = 'upstream.applications_mock';

export function getLocalApplications(): Application[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(APPLICATIONS_KEY);
		if (raw) return JSON.parse(raw);
	} catch {
		// fallback
	}
	return [];
}

export function saveLocalApplications(apps: Application[]): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
}
