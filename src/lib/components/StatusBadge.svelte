<script lang="ts">
	import { statusLabel } from '#lib/marketplace/types.ts';
	let { status }: { status: string } = $props();
</script>

<span class="state-badge" data-status={status}>{statusLabel[status] || status}</span>
