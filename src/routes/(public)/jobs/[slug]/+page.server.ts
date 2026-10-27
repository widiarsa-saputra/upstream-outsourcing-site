import type { PageServerLoad } from './$types';
import { publicApi } from '#lib/server/public-api.ts';
import type { PublicJob } from '#lib/marketplace/types.ts';
export const load: PageServerLoad = async ({ fetch, params, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });
	return { job: await publicApi<PublicJob>(fetch, '/jobs/' + encodeURIComponent(params.slug)) };
};
