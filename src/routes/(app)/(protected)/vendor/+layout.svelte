<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { createMutation } from '@tanstack/svelte-query';
	import { useSession, homeFor } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();
	const session = useSession();
	const logout = createMutation(() => ({ mutationFn: () => session.logout() }));
	$effect(() => {
		if (session.user && session.user.role !== 'VENDOR')
			void goto(homeFor(session.user), { replaceState: true });
	});
</script>

<svelte:head><meta name="robots" content="noindex,nofollow" /></svelte:head>
{#if session.user?.role === 'VENDOR'}<div class="workspace">
		<aside class="sidebar">
			<a class="brand" href={resolve('/')}><span class="brand-mark">u↗</span> upstream.</a>
			<p class="sidebar-label">PARTNER WORKSPACE</p>
			<nav aria-label="Navigasi vendor">
				<a
					class={['nav-link', { active: page.url.pathname === '/vendor' }]}
					href={resolve('/(app)/(protected)/vendor')}
					aria-current={page.url.pathname === '/vendor' ? 'page' : undefined}
					>◎ Profil & clearance</a
				><a
					class={['nav-link', { active: page.url.pathname.startsWith('/vendor/jobs') }]}
					href={resolve('/(app)/(protected)/vendor/jobs')}
					aria-current={page.url.pathname.startsWith('/vendor/jobs') ? 'page' : undefined}
					>◫ Lowongan saya</a
				><a
					class={['nav-link', { active: page.url.pathname.startsWith('/vendor/applications') }]}
					href={resolve('/(app)/(protected)/vendor/applications')}
					aria-current={page.url.pathname.startsWith('/vendor/applications') ? 'page' : undefined}
					>👥 Pelamar & ATS</a
				><a class="nav-link" href={resolve('/(app)/(protected)/account')}>Akun & sesi</a><a
					class="nav-link"
					href={resolve('/(public)/jobs')}>Portal lowongan ↗</a
				>
			</nav>
			<div class="sidebar-bottom">
				<span class="status-dot"></span> PARTNERSHIP & ATS / FASE 04
				<p>Kurasi & rekrut kandidat terbaik.</p>
			</div>
		</aside>
		<main class="workspace-main">
			<header class="workspace-header">
				<span class="breadcrumb">Workspace / Mitra perusahaan</span>
				<div class="user-menu">
					<span>{session.user.name}<small>VENDOR</small></span><button
						class="text-button"
						disabled={logout.isPending}
						onclick={() => logout.mutate()}>Keluar ↗</button
					>
				</div>
			</header>
			{#if logout.isError}<p class="notice error" role="alert">{errorMessage(logout.error)}</p>{/if}
			<div class="workspace-content">{@render children()}</div>
		</main>
	</div>{/if}
