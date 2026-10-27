<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	let {
		children,
		eyebrow = 'SELAMAT DATANG KEMBALI',
		title,
		subtitle
	}: { children: Snippet; eyebrow?: string; title: string; subtitle: string } = $props();
</script>

<div class="auth-page">
	<aside class="auth-aside">
		<a class="brand" href={resolve('/')}><span class="brand-mark">u↗</span> upstream.</a>
		<div class="auth-story">
			<p class="eyebrow">PEOPLE FIRST. ALWAYS.</p>
			<h2>Kesempatan baik<br />bermula dari<br /><em>koneksi yang tepat.</em></h2>
			<p>Satu ruang untuk talenta, mitra, dan tim yang membantu semuanya bergerak maju.</p>
			<div class="orbit" aria-hidden="true"><span>u↗</span></div>
		</div>
		<span class="aside-footer">UPSTREAM / TALENT & OPPORTUNITY</span>
	</aside>
	<main class="auth-main">
		<a class="back-link" href={resolve('/')}>← Kembali ke beranda</a>
		<div class="auth-card">
			<p class="eyebrow">{eyebrow}</p>
			<h1>{title}</h1>
			<p class="muted auth-subtitle">{subtitle}</p>
			{@render children()}
		</div>
		<p class="auth-footer">Dibangun untuk langkah Anda berikutnya.</p>
	</main>
</div>
