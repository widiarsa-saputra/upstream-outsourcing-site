<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { createMutation } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	import { useSession, homeFor } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();
	const session = useSession();
	const logout = createMutation(() => ({ mutationFn: () => session.logout() }));
	$effect(() => {
		if (session.user && !session.user.permissions.includes('admin.overview'))
			void goto(homeFor(session.user), { replaceState: true });
	});
</script>

{#if session.user?.permissions.includes('admin.overview')}
	<div class="workspace">
		<aside class="sidebar">
			<a class="brand" href={resolve('/')}><span class="brand-mark">u↗</span> upstream.</a>
			<p class="sidebar-label">INTERNAL WORKSPACE</p>
			<nav aria-label="Navigasi admin">
				<a
					class={['nav-link', { active: page.url.pathname === '/admin' }]}
					href={resolve('/(app)/(protected)/admin')}
					aria-current={page.url.pathname === '/admin' ? 'page' : undefined}
					><span>◫</span> Ringkasan <span class="nav-arrow">↗</span></a
				>
				{#if session.user.permissions.includes('vendor.verify')}<a
						class={['nav-link', { active: page.url.pathname.startsWith('/admin/vendors') }]}
						href={resolve('/(app)/(protected)/admin/vendors?status=pending')}>◎ Clearance vendor</a
					>{/if}
				{#if session.user.permissions.includes('job.moderate')}<a
						class={['nav-link', { active: page.url.pathname.startsWith('/admin/jobs') }]}
						href={resolve('/(app)/(protected)/admin/jobs?moderationStatus=pending')}
						>▤ Moderasi lowongan</a
					>{/if}
				{#if session.user.permissions.includes('document.verify')}<a
						class={['nav-link', { active: page.url.pathname.startsWith('/admin/documents') }]}
						href={resolve('/(app)/(protected)/admin/documents')}
						>✓ Verifikasi dokumen</a
					>{/if}
				{#if session.user.permissions.includes('application.screen')}<a
						class={['nav-link', { active: page.url.pathname.startsWith('/admin/applications') }]}
						href={resolve('/(app)/(protected)/admin/applications')}
						>📑 Screening lamaran</a
					>{/if}
				{#if session.user.permissions.includes('application.screen')}<a
						class={['nav-link', { active: page.url.pathname.startsWith('/admin/candidates') }]}
						href={resolve('/(app)/(protected)/admin/candidates')}
						>👥 Direktori talenta</a
					>{/if}
				{#if session.user.permissions.includes('audit.read')}<a
						class={['nav-link', { active: page.url.pathname.startsWith('/admin/audit-logs') }]}
						href={resolve('/(app)/(protected)/admin/audit-logs')}
						>📜 Log audit aktivitas</a
					>{/if}
				<a class="nav-link" href={resolve('/(app)/(protected)/account')}
					><span>◎</span> Akun & sesi</a
				>
			</nav>
			<div class="sidebar-bottom">
				<span class="status-dot"></span> OPERASIONAL & AUDIT / FASE 05
				<p>Transparansi & tata kelola platform.</p>
			</div>
		</aside>
		<main class="workspace-main">
			<header class="workspace-header">
				<span class="breadcrumb">Workspace <span>/</span> Overview</span>
				<div class="user-menu">
					<span>{session.user.name}<small>{session.user.role.replaceAll('_', ' ')}</small></span
					><span class="avatar">{session.user.name.charAt(0)}</span><button
						class="text-button"
						disabled={logout.isPending}
						onclick={() => logout.mutate()}>{logout.isPending ? 'Keluar…' : 'Keluar ↗'}</button
					>
				</div>
			</header>
			{#if logout.isError}<p class="notice error" role="alert">{errorMessage(logout.error)}</p>{/if}
			<div class="workspace-content">{@render children()}</div>
		</main>
	</div>
{/if}
