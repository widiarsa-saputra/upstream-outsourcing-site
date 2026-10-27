<script lang="ts">
	import { dateLabel, statusLabel } from '#lib/marketplace/types.ts';
	let {
		reviews
	}: {
		reviews: {
			id: string;
			actorName: string;
			decision: string;
			reason: string;
			createdAt: string;
		}[];
	} = $props();
</script>

<section class="review-history">
	<h2>Histori keputusan</h2>
	{#each reviews as review (review.id)}<article>
			<div>
				<strong>{statusLabel[review.decision] || review.decision}</strong><span
					>{dateLabel(review.createdAt)} · {review.actorName}</span
				>
			</div>
			<p>{review.reason || 'Disetujui tanpa catatan tambahan.'}</p>
		</article>{:else}<p class="muted">Belum ada keputusan review.</p>{/each}
</section>
