<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import type { Job } from '#lib/marketplace/types.ts';
	let { job }: { job: Job } = $props();
	const session = useSession();
	const queries = useQueryClient();
	const action = createMutation(() => ({
		mutationFn: (name: string) =>
			session.api.request<Job>(`/vendor/jobs/${job.id}/${name}`, {
				method: 'POST',
				body: JSON.stringify({ version: job.version })
			}),
		onSuccess: () => queries.invalidateQueries({ queryKey: ['vendor', session.user?.id] })
	}));
</script>

<div class="job-actions">
	{#if job.publicationStatus !== 'closed'}{#if ['draft', 'revision_required', 'rejected'].includes(job.moderationStatus)}<button
				class="button"
				disabled={action.isPending || job.vendorStatus !== 'approved'}
				onclick={() => action.mutate('submit')}>Ajukan moderasi ↗</button
			>{/if}{#if job.moderationStatus === 'approved' && job.publicationStatus !== 'published'}<button
				class="button"
				disabled={action.isPending || job.vendorStatus !== 'approved'}
				onclick={() => {
					if (confirm('Tayangkan lowongan ini di portal publik?')) action.mutate('publish');
				}}>Publikasikan ↗</button
			>{/if}{#if job.publicationStatus === 'published'}<button
				class="button secondary"
				disabled={action.isPending}
				onclick={() => action.mutate('pause')}>Jeda lowongan</button
			>{/if}<button
			class="button secondary"
			disabled={action.isPending}
			onclick={() => {
				if (confirm('Tutup lowongan ini? Lowongan yang ditutup tidak dapat dibuka kembali.'))
					action.mutate('close');
			}}>Tutup lowongan</button
		>{/if}
</div>
{#if job.vendorStatus !== 'approved'}<p class="notice">
		Vendor harus lolos clearance sebelum lowongan dapat diajukan dan dipublikasikan.
	</p>{/if}{#if action.isError}<p class="notice error" role="alert">
		{errorMessage(action.error)}
	</p>{/if}
