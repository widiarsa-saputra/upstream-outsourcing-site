<script lang="ts">
	import { resolve } from '$app/paths';
	import { createQuery } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import type { components } from '#lib/api/schema.d.ts';

	type AuditLogPage = components['schemas']['AuditLogPageResponse'];

	const session = useSession('admin');
	const allowed = $derived(!!session.user?.permissions.includes('audit.read'));

	let actionFilter = $state('');
	let pageNumber = $state(1);

	const logsQuery = createQuery(() => ({
		queryKey: ['admin', session.user?.id, 'audit-logs', actionFilter, pageNumber],
		enabled: allowed,
		queryFn: ({ signal }) =>
			session.api.request<AuditLogPage>(
				`/admin/audit-logs?page=${pageNumber}&pageSize=20${actionFilter ? `&action=${encodeURIComponent(actionFilter)}` : ''}`,
				{ signal }
			)
	}));

	function formatDateTime(iso: string) {
		return new Date(iso).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function actionBadgeTone(action: string) {
		if (action.includes('created') || action.includes('active') || action.includes('approved') || action.includes('verified')) {
			return 'background: #dcfce7; color: #166534;';
		}
		if (action.includes('rejected') || action.includes('disabled') || action.includes('removed')) {
			return 'background: #fee2e2; color: #991b1b;';
		}
		return 'background: #f1f5f9; color: #475569;';
	}
</script>

<svelte:head>
	<title>Log Audit Aktivitas — Upstream</title>
</svelte:head>

<div class="page-heading">
	<div>
		<p class="eyebrow">GOVERNANCE & AUDIT TRAIL</p>
		<h1>Log Audit <em>Aktivitas Sensitif.</em></h1>
		<p class="lead">
			Catatan jejak audit permanen untuk setiap tindakan staf, verifikasi identitas, persetujuan lowongan, dan mutasi akun.
		</p>
	</div>
</div>

{#if !allowed}
	<p class="notice error" role="alert">
		Anda tidak memiliki hak akses membaca log audit (memerlukan izin <code>audit.read</code>).
	</p>
{:else}
	<div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
		<input
			type="search"
			placeholder="Filter aksi (misal: staff, candidate, vendor, job)..."
			bind:value={actionFilter}
			style="flex: 1; min-width: 260px; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px; background: white;"
		/>
	</div>

	{#if logsQuery.isPending}
		<div class="notice" role="status">Memuat data log audit dari backend…</div>
	{:else if logsQuery.isError}
		<div class="notice error" role="alert">{errorMessage(logsQuery.error)}</div>
	{:else if (logsQuery.data.items || []).length === 0}
		<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 32px; text-align: center;">
			<p class="muted" style="margin: 0; font-style: italic;">Belum ada log audit yang terekam.</p>
		</section>
	{:else}
		<section class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 20px;">
			<div class="table-scroll">
				<table>
					<thead>
						<tr>
							<th>Waktu Kejadian (UTC/Local)</th>
							<th>Aksi / Operasi</th>
							<th>Pelaku (Actor)</th>
							<th>Target ID</th>
						</tr>
					</thead>
					<tbody>
						{#each logsQuery.data.items as log (log.id)}
							<tr>
								<td>
									<small style="font-family: monospace; font-size: 13px;">{formatDateTime(log.createdAt)}</small>
								</td>
								<td>
									<span
										style="display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; font-family: monospace; {actionBadgeTone(log.action)}"
									>
										{log.action}
									</span>
								</td>
								<td>
									<span>{log.actorName || log.actorId || 'Sistem Otomatis'}</span>
								</td>
								<td>
									<small class="muted" style="font-family: monospace;">{log.targetId || '-'}</small>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination Info -->
			<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; border-top: 1px solid var(--line); padding-top: 14px;">
				<span class="muted" style="font-size: 13px;">
					Total: {logsQuery.data.total} catatan (Halaman {logsQuery.data.page} dari {logsQuery.data.totalPages || 1})
				</span>
				<div style="display: flex; gap: 8px;">
					<button
						class="button secondary small"
						disabled={pageNumber <= 1}
						onclick={() => (pageNumber = Math.max(1, pageNumber - 1))}
					>
						← Sebelumnya
					</button>
					<button
						class="button secondary small"
						disabled={pageNumber >= logsQuery.data.totalPages}
						onclick={() => (pageNumber = pageNumber + 1)}
					>
						Berikutnya →
					</button>
				</div>
			</div>
		</section>
	{/if}
{/if}
