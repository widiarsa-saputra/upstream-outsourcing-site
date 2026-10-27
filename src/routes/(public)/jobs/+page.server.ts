import type { PageServerLoad } from './$types';
import { publicApi, publicFilters } from '#lib/server/public-api.ts';
import type { PublicJobPage } from '#lib/marketplace/types.ts';
export const load: PageServerLoad = async ({ fetch, url, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });
	const filters = publicFilters(url.searchParams, 'jobs');
	return {
		jobs: await publicApi<PublicJobPage>(fetch, '/jobs?' + filters),
		filters: Object.fromEntries(filters)
	};
};
