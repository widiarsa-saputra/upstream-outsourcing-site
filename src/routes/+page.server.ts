import type { PageServerLoad } from './$types';
import { publicApi } from '#lib/server/public-api.ts';
import type { PublicJobPage } from '#lib/marketplace/types.ts';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });
	try {
		const jobs = await publicApi<PublicJobPage>(fetch, '/jobs?pageSize=6&sort=newest');
		return { jobs };
	} catch {
		return {
			jobs: { items: [], total: 0, page: 1, pageSize: 6, totalPages: 0 } as PublicJobPage
		};
	}
};
