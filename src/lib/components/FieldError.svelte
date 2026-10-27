<script lang="ts">
	import { fieldError } from '#lib/api/client.ts';
	let { error, field }: { error: unknown; field: string } = $props();
	const message = $derived(fieldError(error, field));
</script>

{#if message}<p class="field-error" role="alert">{message}</p>{/if}
