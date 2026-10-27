<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head
	><title>{page.error?.status || 'Halaman tidak tersedia'} — Upstream</title><meta
		name="robots"
		content="noindex"
	/></svelte:head
>
<section class="empty-state public-error">
	<p class="eyebrow">RUANG UNTUK LANGKAH BERIKUTNYA</p>
	<h1>
		{page.error?.status === 404 ? 'Peluang ini belum tersedia.' : 'Ada kendala memuat halaman.'}
	</h1>
	<p>{page.error?.message}</p>
	<a class="button" href={resolve('/(public)/jobs')}>Jelajahi lowongan lain →</a>
</section>
