<script lang="ts">
	import PublicHeader from '#lib/components/PublicHeader.svelte';
	import PublicFooter from '#lib/components/PublicFooter.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="public-site">
	<PublicHeader />
	<main>{@render children()}</main>
	<PublicFooter />
</div>
