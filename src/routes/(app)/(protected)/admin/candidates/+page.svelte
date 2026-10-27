<script lang="ts">
	import { resolve } from '$app/paths';
	import { useSession } from '#lib/auth/session.svelte.ts';

	const session = useSession();
	const allowed = $derived(!!session.user?.permissions.includes('application.screen'));

	interface TalentItem {
		id: string;
		name: string;
		email: string;
		headline: string;
		location: string;
		skills: string[];
		profileCompleted: number;
		documentsStatus: 'verified' | 'pending' | 'incomplete';
	}

	const candidatesList: TalentItem[] = [
		{
			id: 'cand-1',
			name: 'Budi Santoso',
			email: 'budi.santoso@example.com',
			headline: 'Admin Logistik & Warehouse Operator',
			location: 'Denpasar, Bali',
			skills: ['Manajemen Gudang', 'Microsoft Excel', 'K3 Logistik'],
			profileCompleted: 90,
			documentsStatus: 'pending'
		},
		{
			id: 'cand-2',
			name: 'Siti Rahmawati',
			email: 'siti.rahma@example.com',
			headline: 'Customer Support & Front Desk Staff',
			location: 'Badung, Bali',
			skills: ['Komunikasi Publik', 'Customer Service', 'Bahasa Inggris Aktif'],
			profileCompleted: 100,
			documentsStatus: 'verified'
		},
		{
			id: 'cand-3',
			name: 'Made Aryawan',
			email: 'made.aryawan@example.com',
			headline: 'Junior Web Developer / IT Support',
			location: 'Gianyar, Bali',
			skills: ['JavaScript', 'HTML/CSS', 'Troubleshooting Jaringan'],
			profileCompleted: 70,
			documentsStatus: 'incomplete'
		}
	];

	let search = $state('');
	let filterLoc = $state('all');

	const filteredCandidates = $derived.by(() => {
		return candidatesList.filter((c) => {
			const matchSearch =
				!search.trim() ||
				c.name.toLowerCase().includes(search.toLowerCase()) ||
				c.headline.toLowerCase().includes(search.toLowerCase()) ||
				c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

			const matchLoc = filterLoc === 'all' || c.location.toLowerCase().includes(filterLoc.toLowerCase());

			return matchSearch && matchLoc;
		});
	});
</script>

<svelte:head>
	<title>Direktori Talenta — Upstream</title>
</svelte:head>

<div class="page-heading">
	<div>
		<p class="eyebrow">TALENT ACQUISITION POOL</p>
		<h1>Direktori <em>Talenta & Kandidat.</em></h1>
		<p class="lead">
			Daftar kandidat yang telah mendaftar, melengkapi CV digital, dan siap disalurkan ke mitra alih daya.
		</p>
	</div>
</div>

{#if !allowed}
	<p class="notice error" role="alert">
		Anda tidak memiliki hak akses kurasi talenta (memerlukan izin <code>application.screen</code>).
	</p>
{:else}
	<div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
		<input
			type="search"
			placeholder="Cari berdasarkan nama, posisi, atau keahlian (skills)..."
			bind:value={search}
			style="flex: 1; min-width: 260px; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px; background: white;"
		/>
		<select
			bind:value={filterLoc}
			style="padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px; background: white;"
		>
			<option value="all">Semua Lokasi</option>
			<option value="Denpasar">Denpasar</option>
			<option value="Badung">Badung</option>
			<option value="Gianyar">Gianyar</option>
		</select>
	</div>

	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
		{#each filteredCandidates as cand (cand.id)}
			<div class="panel" style="background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
				<div>
					<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
						<div>
							<h2 style="font-size: 1.2rem; margin: 0; color: var(--green);">{cand.name}</h2>
							<p class="muted" style="font-size: 13px; margin: 2px 0 0;">{cand.email}</p>
						</div>
						<span
							style="display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px;
							{cand.documentsStatus === 'verified' ? 'background: #dcfce7; color: #166534;' : ''}
							{cand.documentsStatus === 'pending' ? 'background: #fef9c3; color: #854d0e;' : ''}
							{cand.documentsStatus === 'incomplete' ? 'background: #fee2e2; color: #991b1b;' : ''}"
						>
							{cand.documentsStatus === 'verified'
								? 'Dokumen Valid'
								: cand.documentsStatus === 'pending'
									? 'Review Berkas'
									: 'Belum Lengkap'}
						</span>
					</div>

					<p style="font-weight: 600; color: var(--ink); margin: 6px 0 2px; font-size: 14px;">{cand.headline}</p>
					<p class="muted" style="font-size: 13px; margin: 0 0 14px;">📍 {cand.location}</p>

					<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
						{#each cand.skills as sk}
							<span style="font-size: 11px; background: #eef2eb; color: var(--green); padding: 3px 8px; border-radius: 4px; font-weight: 500;">
								{sk}
							</span>
						{/each}
					</div>
				</div>

				<div style="border-top: 1px solid var(--line); padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
					<span class="muted" style="font-size: 12px;">Profil {cand.profileCompleted}% lengkap</span>
					<button
						class="button secondary small"
						onclick={() => alert(`Detail profil & CV digital untuk kandidat ${cand.name} siap ditautkan ke rute kurasi internal.`)}
					>
						Lihat Detail ↗
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}
