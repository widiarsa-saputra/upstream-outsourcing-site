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
		if (session.user && session.user.role !== 'CANDIDATE') {
			void goto(homeFor(session.user), { replaceState: true });
		}
	});
</script>

<svelte:head><meta name="robots" content="noindex,nofollow" /></svelte:head>

{#if session.user?.role === 'CANDIDATE'}
	<div class="workspace">
		<aside class="sidebar">
			<a class="brand" href={resolve('/')}><span class="brand-mark">u↗</span> upstream.</a>
			<p class="sidebar-label">TALENT PORTAL</p>
			<nav aria-label="Navigasi kandidat">
				<a
					class={['nav-link', { active: page.url.pathname === '/candidate' }]}
					href={resolve('/(app)/(protected)/candidate')}
					aria-current={page.url.pathname === '/candidate' ? 'page' : undefined}
				>
					<span>◫</span> Ringkasan
				</a>
				<a
					class={['nav-link', { active: page.url.pathname.startsWith('/candidate/profile') }]}
					href={resolve('/(app)/(protected)/candidate/profile')}
					aria-current={page.url.pathname.startsWith('/candidate/profile') ? 'page' : undefined}
				>
					<span>◎</span> CV & Profil Digital
				</a>
				<a
					class={['nav-link', { active: page.url.pathname.startsWith('/candidate/documents') }]}
					href={resolve('/(app)/(protected)/candidate/documents')}
					aria-current={page.url.pathname.startsWith('/candidate/documents') ? 'page' : undefined}
				>
					<span>▤</span> Document Vault
				</a>
				<a
					class="nav-link"
					href={resolve('/(public)/jobs')}
				>
					<span>↗</span> Cari Lowongan
				</a>
				<a class="nav-link" href={resolve('/(app)/(protected)/account')}>
					<span>⚙</span> Akun & Sesi
				</a>
			</nav>
			<div class="sidebar-bottom">
				<span class="status-dot"></span> KANDIDAT / FASE 01
				<p>Profil terverifikasi membuka peluang kerja alih daya terbaik.</p>
			</div>
		</aside>

		<main class="workspace-main">
			<header class="workspace-header">
				<span class="breadcrumb">Workspace / Portal Kandidat</span>
				<div class="user-menu">
					<span>{session.user.name}<small>KANDIDAT</small></span>
					<button
						class="text-button"
						disabled={logout.isPending}
						onclick={() => logout.mutate()}
					>
						{logout.isPending ? 'Keluar…' : 'Keluar ↗'}
					</button>
				</div>
			</header>

			{#if logout.isError}
				<p class="notice error" role="alert">{errorMessage(logout.error)}</p>
			{/if}

			<div class="workspace-content">
				{@render children()}
			</div>
		</main>
	</div>
{/if}
