<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();
</script>

<div class="public-site">
	<header class="public-header">
		<a class="brand" href={resolve('/')}><span class="brand-mark">u↗</span> upstream.</a>
		<nav aria-label="Navigasi publik">
			<a class={{ current: page.url.pathname.startsWith('/jobs') }} href={resolve('/(public)/jobs')}
				>Temukan peluang</a
			><a
				class={{ current: page.url.pathname.startsWith('/vendors') }}
				href={resolve('/(public)/vendors')}>Mitra perusahaan</a
			>
		</nav>
		<a class="button secondary" href={resolve('/(app)/login')}>Masuk portal ↗</a>
	</header>
	<main>{@render children()}</main>
	<footer class="public-footer">
		<a class="brand" href={resolve('/')}>upstream.</a>
		<p>Koneksi yang tepat. Langkah yang berarti.</p>
		<a class="text-link" href={resolve('/(app)/register?role=VENDOR')}>Bergabung sebagai mitra ↗</a>
	</footer>
</div>
