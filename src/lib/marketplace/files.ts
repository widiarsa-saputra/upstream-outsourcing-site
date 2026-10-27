import type { ApiClient } from '#lib/api/client.ts';
import type { UploadIntent } from './types';
export async function uploadLegal(api: ApiClient, type: 'NPWP' | 'NIB' | 'AGREEMENT', file: File) {
	if (
		file.size > 5242880 ||
		file.size < 1 ||
		!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
	)
		throw new Error('Pilih PDF, JPG, atau PNG dengan ukuran maksimal 5 MB.');
	const intent = await api.request<UploadIntent>('/vendor/legal-documents/upload-intents', {
		method: 'POST',
		body: JSON.stringify({ type, name: file.name, mimeType: file.type, size: file.size })
	});
	if (intent.uploadUrl) {
		const result = await fetch(intent.uploadUrl, {
			method: 'PUT',
			headers: intent.headers,
			body: file,
			credentials: 'omit',
			signal: AbortSignal.timeout(60000)
		});
		if (!result.ok) throw new Error('Unggah ke storage gagal. Periksa koneksi dan coba kembali.');
	} else
		await api.request(intent.uploadPath, {
			method: 'PUT',
			anonymous: true,
			headers: intent.headers,
			body: file,
			timeoutMs: 60000
		});
	return api.request('/vendor/legal-documents/' + intent.id + '/complete', { method: 'POST' });
}
export async function downloadLegal(api: ApiClient, path: string, name: string) {
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
