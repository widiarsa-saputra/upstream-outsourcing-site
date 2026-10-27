import type { PageServerLoad } from './$types';
import { publicApi, publicFilters } from '#lib/server/public-api.ts';
import type { PublicVendorPage } from '#lib/marketplace/types.ts';
export const load: PageServerLoad = async ({ fetch, url, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });
	const filters = publicFilters(url.searchParams, 'vendors');
	return {
		vendors: await publicApi<PublicVendorPage>(fetch, '/vendors?' + filters),
		filters: Object.fromEntries(filters)
	};
};
