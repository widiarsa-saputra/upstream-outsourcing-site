<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import { useSession } from '#lib/auth/session.svelte.ts';
	import { errorMessage } from '#lib/api/client.ts';
	import type { Job } from '#lib/marketplace/types.ts';
	import JobForm from '#lib/components/JobForm.svelte';
	const session = useSession();
	const job = createQuery(() => ({
		queryKey: ['vendor', session.user?.id, 'job', page.params.id],
		enabled: session.user?.role === 'VENDOR',
		queryFn: ({ signal }) => session.api.request<Job>('/vendor/jobs/' + page.params.id, { signal })
	}));
</script>

<svelte:head><title>Edit lowongan — Upstream</title></svelte:head>
<div class="page-heading">
	<div>
		<p class="eyebrow">SIAPKAN PELUANG TERBAIK</p>
		<h1>Edit lowongan.</h1>
	</div>
</div>
{#if job.isPending}<p class="notice" role="status">Memuat lowongan…</p>{:else if job.isError}<p
		class="notice error"
		role="alert"
	>
		{errorMessage(job.error)}
	</p>{:else if job.data}{#if job.data.publicationStatus === 'closed'}<p class="notice">
			Lowongan sudah ditutup dan tidak dapat diedit.
		</p>{:else}{#key job.data.id + job.data.version}<JobForm job={job.data} />{/key}{/if}{/if}
