import { PUBLIC_API_URL } from '$app/env/public';
import { error } from '@sveltejs/kit';
export async function publicApi<T>(fetcher: typeof fetch, path: string): Promise<T> {
	let response: Response;
	try {
		response = await fetcher(PUBLIC_API_URL + '/public' + path, {
			headers: { Accept: 'application/json' },
			signal: AbortSignal.timeout(10000)
		});
	} catch {
		error(503, 'Portal lowongan belum dapat terhubung. Silakan coba beberapa saat lagi.');
	}
	if (!response.ok)
		error(
			response.status === 404
				? 404
				: response.status === 422 || response.status === 400
					? 400
					: 503,
			response.status === 404
				? 'Lowongan atau perusahaan tidak ditemukan.'
				: 'Data belum dapat dimuat. Periksa filter atau coba kembali.'
		);
	return response.json() as Promise<T>;
}
export function publicFilters(params: URLSearchParams, kind: 'jobs' | 'vendors') {
	const allowed = [
		'q',
		'industry',
		'location',
		'page',
		'pageSize',
		'sort',
		...(kind === 'jobs'
			? [
					'workMode',
					'employmentType',
					'vendor',
					'vendorSlug',
					'salaryMin',
					'salaryMax',
					'salaryPeriod'
				]
			: [])
	];
	const result = new URLSearchParams();
	for (const key of allowed) {
		const value = params.get(key);
		if (value?.trim()) result.set(key, value.trim());
	}
	return result;
}
