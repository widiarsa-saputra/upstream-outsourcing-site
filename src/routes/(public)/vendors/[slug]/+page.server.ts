import type { PageServerLoad } from './$types';
import { publicApi } from '#lib/server/public-api.ts';
import type { PublicVendor, PublicJobPage } from '#lib/marketplace/types.ts';
export const load: PageServerLoad = async ({ fetch, params, url, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });
	const vendor = await publicApi<PublicVendor>(
		fetch,
		'/vendors/' + encodeURIComponent(params.slug)
	);
	const query = new URLSearchParams({
		vendorSlug: vendor.slug,
		page: url.searchParams.get('page') || '1'
	});
	return { vendor, jobs: await publicApi<PublicJobPage>(fetch, '/jobs?' + query) };
};
