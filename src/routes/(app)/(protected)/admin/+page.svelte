<script lang="ts">
	import { resolve } from '$app/paths';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	const session = useSession();
	const queries = useQueryClient();
	let inviteName = $state('');
	let inviteEmail = $state('');
	let inviteRole = $state('TALENT_ACQUISITION');
	const invite = createMutation(() => ({
		mutationFn: () =>
			session.api.request<{ message: string }>('/admin/staff', {
				method: 'POST',
				body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole })
			}),
		onSuccess: async () => {
			inviteName = '';
			inviteEmail = '';
			await queries.invalidateQueries({ queryKey: ['admin', session.user?.id] });
		}
	}));
	import type { components } from '#lib/api/schema.d.ts';
	type Overview = components['schemas']['OverviewResponse'];
	const overview = createQuery(() => ({
		queryKey: ['admin', session.user?.id, 'overview'],
		enabled:
			session.status === 'authenticated' && !!session.user?.permissions.includes('admin.overview'),
		queryFn: ({ signal }) => session.api.request<Overview>('/admin/overview', { signal })
	}));
	const staff = createQuery(() => ({
		queryKey: ['admin', session.user?.id, 'staff'],
		enabled:
			session.status === 'authenticated' && !!session.user?.permissions.includes('staff.manage'),
		queryFn: ({ signal }) =>
			session.api.request<
				{ id: string; name: string; email: string; role: string; status: string }[]
			>('/admin/staff', { signal })
	}));
</script>

<svelte:head
	><title>Ringkasan workspace — Upstream</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<div class="page-heading">
	<div>
		<p class="eyebrow">GAMBARAN BESAR, LANGKAH BERIKUTNYA</p>
		<h1>Halo, {session.user?.name.split(' ')[0]}<span class="accent">.</span></h1>
		<p class="muted">Semua koneksi dan aktivitas platform, dalam satu ruang.</p>
	</div>
	<button class="button secondary" disabled={overview.isFetching} onclick={() => overview.refetch()}
		>{overview.isFetching ? 'Memuat…' : 'Perbarui data ↻'}</button
	>
</div>
{#if overview.isPending}<div class="notice" role="status">Memuat ringkasan platform…</div>
{:else if overview.isError}<div class="notice error" role="alert">
		{errorMessage(overview.error)}
		<button class="text-button" onclick={() => overview.refetch()}>Coba kembali</button>
	</div>
{:else if overview.data}<div class="stats-grid">
		{#each [{ label: 'Kandidat aktif', value: overview.data.candidates, caption: 'Talenta dalam ekosistem', mark: '01' }, { label: 'Mitra perusahaan', value: overview.data.vendors, caption: 'Koneksi yang terus tumbuh', mark: '02' }, { label: 'Menunggu clearance', value: overview.data.pendingVendors, caption: 'Vendor dalam antrean verifikasi', mark: '03' }, { label: 'Staf internal', value: overview.data.staff, caption: 'Tim di balik setiap peluang', mark: '04' }] as stat (stat.mark)}<article
				class="stat-card"
			>
				<div><span>{stat.label}</span><small>{stat.mark} /</small></div>
				<strong>{stat.value.toLocaleString('id-ID')}</strong>
				<p>{stat.caption}</p>
			</article>{/each}
	</div>{/if}
<div class="dashboard-grid">
	<section class="panel">
		<div class="section-heading">
			<div>
				<p class="eyebrow">TIM ANDA</p>
				<h2>Orang di balik Upstream.</h2>
			</div>
			<span class="tag">INTERNAL</span>
		</div>
		{#if session.user?.permissions.includes('staff.manage')}{#if staff.isPending}<p
					class="muted"
					role="status"
				>
					Memuat anggota tim…
				</p>{:else if staff.isError}<p class="notice error" role="alert">
					{errorMessage(staff.error)}
				</p>{:else}<div class="table-scroll">
					<table>
						<thead><tr><th>Anggota tim</th><th>Peran</th><th>Status</th></tr></thead><tbody
							>{#each staff.data || [] as member (member.id)}<tr
									><td><strong>{member.name}</strong><small>{member.email}</small></td><td
										>{member.role.replaceAll('_', ' ')}</td
									><td
										><span class="status-pill"
											>{member.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}</span
										></td
									></tr
								>{:else}<tr><td colspan="3">Belum ada anggota tim.</td></tr>{/each}</tbody
						>
					</table>
				</div>{/if}{:else}<p class="muted">
				Pengelolaan anggota tim tersedia untuk superadmin.
			</p>{/if}
	</section>
	<aside class="progress-panel">
		<p class="eyebrow">ANTREAN OPERASIONAL</p>
		<span class="progress-number">02<span>/ 05</span></span>
		<h2>Mitra tepercaya.<br />Peluang terkurasi.</h2>
		<p>Tinjau legalitas mitra dan kelayakan lowongan sebelum peluang baru ditayangkan ke publik.</p>
		<div class="progress-line"><span></span></div>
		{#if session.user?.permissions.includes('vendor.verify')}<a
				class="text-link"
				href={resolve('/(app)/(protected)/admin/vendors?status=pending')}
				>Tinjau clearance vendor →</a
			>{/if}
		{#if session.user?.permissions.includes('job.moderate')}<p>
				<a
					class="text-link"
					href={resolve('/(app)/(protected)/admin/jobs?moderationStatus=pending')}
					>Tinjau moderasi lowongan →</a
				>
			</p>{/if}
	</aside>
</div>

{#if session.user?.permissions.includes('staff.manage')}
	<section class="panel invite-panel">
		<div class="section-heading">
			<div>
				<p class="eyebrow">AKSES TIM</p>
				<h2>Undang rekan kerja.</h2>
			</div>
		</div>
		<p class="muted">Rekan Anda akan menerima tautan email untuk membuat password sendiri.</p>
		<form
			class="invite-form"
			onsubmit={(event) => {
				event.preventDefault();
				invite.mutate();
			}}
		>
			<div>
				<label for="invite-name">Nama lengkap</label><input
					id="invite-name"
					bind:value={inviteName}
					required
					minlength="2"
					maxlength="100"
					autocomplete="name"
				/>
			</div>
			<div>
				<label for="invite-email">Email staf</label><input
					id="invite-email"
					type="email"
					bind:value={inviteEmail}
					required
					autocomplete="email"
				/>
			</div>
			<div>
				<label for="invite-role">Peran</label><select id="invite-role" bind:value={inviteRole}
					><option value="TALENT_ACQUISITION">Talent Acquisition</option><option value="LEGAL"
						>Legal / Compliance</option
					><option value="SUPERADMIN">Superadmin</option></select
				>
			</div>
			<button class="button" disabled={invite.isPending}
				>{invite.isPending ? 'Mengirim…' : 'Kirim undangan ↗'}</button
			>
		</form>
		{#if invite.isSuccess}<p class="notice" role="status">
				{invite.data.message}
			</p>{/if}{#if invite.isError}<p class="notice error" role="alert">
				{errorMessage(invite.error)}
			</p>{/if}
	</section>
{/if}
