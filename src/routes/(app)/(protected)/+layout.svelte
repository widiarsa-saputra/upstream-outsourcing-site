<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();
	const adminSession = useSession('admin');
	const userSession = useSession('user');
	const isStaffArea = $derived(page.url.pathname.startsWith('/admin'));
	const session = $derived(isStaffArea ? adminSession : userSession);
	$effect(() => {
		if (session.status === 'anonymous') {
			const targetPath = isStaffArea
				? resolve('/(app)/admin/login')
				: resolve('/(app)/login');
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			void goto(`${targetPath}?returnTo=${encodeURIComponent(page.url.pathname)}`, {
				replaceState: true
			});
		}
	});
</script>

{#if session.status === 'authenticated' && session.user}{@render children()}
{:else if session.status === 'error'}<main class="center-state">
		<h1>Koneksi belum tersedia.</h1>
		<p role="alert">{session.error}</p>
		<button class="button" onclick={() => session.bootstrap()}>Coba kembali</button>
	</main>
{:else}<main class="center-state" aria-live="polite">
		<span class="brand-mark">u↗</span>
		<p>Menyiapkan ruang kerja Anda…</p>
	</main>{/if}
