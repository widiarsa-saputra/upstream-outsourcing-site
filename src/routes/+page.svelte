<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head
	><title>Upstream — Langkah berikutnya dimulai di sini</title><meta
		name="description"
		content="Platform alih daya dan rekrutmen yang mempertemukan talenta dengan peluang kerja."
	/></svelte:head
>
<div class="landing">
	<header class="public-header">
		<a class="brand" href={resolve('/')}
			><span class="brand-mark">u↗</span> upstream<span class="brand-dot">.</span></a
		><a class="button secondary" href={resolve('/(app)/login')}>Masuk portal <span>↗</span></a>
	</header>
	<main class="landing-main">
		<p class="eyebrow">MANUSIA. PELUANG. PERTUMBUHAN.</p>
		<h1>Langkah berikutnya,<br /><em>bersama Upstream.</em></h1>
		<p class="lead">
			Ruang bertemunya talenta dan perusahaan. Bangun profil Anda, temukan koneksi, dan tumbuh
			bersama.
		</p>
		<div class="actions">
			<a class="button" href={resolve('/(public)/jobs')}>Jelajahi lowongan ↗</a>
			<a class="button secondary" href={resolve('/(app)/register')}>Daftar sebagai kandidat ↗</a><a
				class="text-link"
				href={resolve('/(app)/register?role=VENDOR')}>Untuk mitra perusahaan →</a
			>
		</div>
		<div class="landing-rule">
			<span>01 / TALENT & OPPORTUNITY</span><span>Melangkah lebih jauh.</span>
		</div>
	</main>
	<footer>UPSTREAM / PLATFORM ALIH DAYA & REKRUTMEN</footer>
</div>
