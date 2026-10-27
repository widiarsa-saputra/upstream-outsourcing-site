<script lang="ts">
	import { untrack } from 'svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	let {
		kind,
		id,
		version,
		status
	}: { kind: 'vendors' | 'jobs'; id: string; version: number; status: string } = $props();
	const session = useSession();
	const queries = useQueryClient();
	let decision = $state(untrack(() => (status === 'approved' ? 'suspended' : 'approved')));
	let reason = $state('');
	const review = createMutation(() => ({
		mutationFn: () =>
			session.api.request(`/admin/${kind}/${id}/reviews`, {
				method: 'POST',
				body: JSON.stringify({ version, decision, reason })
			}),
		onSuccess: () => queries.invalidateQueries({ queryKey: ['admin', session.user?.id] })
	}));
	const canReview = $derived(
		status === 'pending' || (kind === 'vendors' && ['approved', 'suspended'].includes(status))
	);
</script>

<section class="panel decision-panel">
	<p class="eyebrow">KEPUTUSAN INTERNAL</p>
	<h2>{kind === 'vendors' ? 'Hasil clearance.' : 'Hasil moderasi.'}</h2>
	{#if canReview}<form
			onsubmit={(event) => {
				event.preventDefault();
				if (
					confirm(
						'Simpan keputusan ini? Hasilnya dicatat dalam histori dan disampaikan kepada vendor.'
					)
				)
					review.mutate();
			}}
		>
			<label for="review-decision">Keputusan</label><select
				id="review-decision"
				bind:value={decision}
				>{#if status === 'approved' && kind === 'vendors'}<option value="suspended"
						>Tangguhkan vendor</option
					>{:else}<option value="approved"
						>{status === 'suspended' ? 'Aktifkan kembali vendor' : 'Setujui'}</option
					>{#if status === 'pending'}<option value="revision_required">Minta revisi</option><option
							value="rejected">Tolak</option
						>{/if}{/if}</select
			><label for="review-reason">Alasan / catatan keputusan</label><textarea
				id="review-reason"
				bind:value={reason}
				required={decision !== 'approved'}
				maxlength="2000"
				rows="4"
				placeholder="Jelaskan temuan dan perbaikan yang dibutuhkan…"></textarea>
			<p class="field-help">
				Alasan wajib untuk revisi, penolakan, dan penangguhan; catatan ini terlihat oleh vendor.
			</p>
			<button class="button" disabled={review.isPending}
				>{review.isPending ? 'Menyimpan…' : 'Simpan keputusan →'}</button
			>
		</form>{:else}<p class="muted">
			Keputusan hanya dapat diberikan setelah pengajuan dikirim oleh vendor.
		</p>{/if}{#if review.isError}<p class="notice error" role="alert">
			{errorMessage(review.error)}
			<button
				class="text-button"
				onclick={() => queries.invalidateQueries({ queryKey: ['admin', session.user?.id] })}
				>Muat versi terbaru</button
			>
		</p>{/if}
</section>
