# Upstream Outsourcing Site

SvelteKit 3 + Svelte 5 + TypeScript + Tailwind CSS + TanStack Query Svelte 6.

## Menjalankan lokal

```bash
npm ci
cp .env.example .env
npm run dev
```

Jalankan sibling backend `../upstream-outsourcing-api` sesuai README backend. Default frontend `http://localhost:5173`, API `http://localhost:3001/api/v1`. `PUBLIC_API_URL` didefinisikan di `src/env.ts` menggunakan environment API SvelteKit 3. Nilai ditentukan saat build, dan dipakai pula untuk `connect-src` CSP; isi environment sebelum build ketika menggunakan API/domain lain. Sesuaikan `FRONTEND_URL` backend dengan Origin frontend persis (termasuk port).

Buka `/login`; superadmin awal dibuat melalui command `admin:create` backend. Tidak tersedia akun default. `/register` membuat kandidat/vendor dan mengirim tautan verifikasi melalui email. Email development dapat dibuka di Mailpit jika Compose backend dipakai. SMTP dan Google OAuth dikonfigurasi di backend; tidak ada secret di frontend.

## Rendering dan auth

- Landing `/` dirender di server; root tidak menonaktifkan SSR. Area `(app)` secara eksplisit `ssr=false`, `csr=true`, `prerender=false`.
- `/admin` sepenuhnya CSR. Query overview/staf, undangan, sesi akun, serta auth memakai TanStack Query; tidak ada server load, server action atau proxy API dashboard.
- JWT access token disimpan di localStorage sebagai `upstream.access_token`, lalu dikirim dalam Bearer header. Refresh token hanya pada cookie HttpOnly milik API.
- Bootstrap `/auth/me` menunggu sesi siap sebelum dashboard dipasang. Client melakukan refresh tunggal untuk beberapa 401 bersamaan, retry sekali, dan membedakan 403 dari session expiry. Network/5xx saat bootstrap menampilkan retry tanpa menghapus token.
- Web Locks menyinkronkan rotasi refresh antar-tab pada browser modern. Storage events menyinkronkan perubahan sesi/logout. Logout membatalkan query dan membuang seluruh cache privat; cache tidak dipersist ke storage.
- Menu/redirect di frontend untuk UX; permission diperiksa kembali pada backend. Kandidat/vendor tidak dapat memakai endpoint admin meskipun memodifikasi localStorage atau URL.
- `/candidate` dan `/vendor` adalah shell auth untuk tahap berikutnya; `/account` menyediakan daftar dan pencabutan sesi lain. `/admin` memiliki ringkasan database, daftar staf, dan undangan staf.
- Route verifikasi/reset memakai token pada fragment email; fragment dihapus dari address bar setelah dibaca. Google callback menghapus code/state dari address bar setelah dibaca, lalu bertukar code melalui backend.
- CSP membatasi script ke origin sendiri dengan nonce/hash SvelteKit; halaman privat tidak diindeks. Simpan hanya access token di localStorage, bukan refresh token atau dokumen/PII.

## Pemeriksaan

```bash
npm run check
npm run lint
npm run test:unit -- --run --project server
npm run build
npm run test:e2e
```

Playwright default menjalankan build+preview di port 4173. Test frontend mengintersep API untuk memeriksa CSR, token, reload, redirect role dan mobile; backend mempunyai integration test terpisah terhadap PostgreSQL asli. Smoke test tanpa mock tersedia:

```bash
E2E_BASE_URL=http://localhost:5173 E2E_LIVE=1 \
E2E_ADMIN_EMAIL=admin@example.com E2E_ADMIN_PASSWORD='password-akun-test' \
npx playwright test tests/auth-live.e2e.ts
```

Gunakan akun dan database test, API aktif dengan `FRONTEND_URL` sesuai E2E_BASE_URL. Smoke memeriksa login real API, request dashboard dari browser, pemulihan refresh cookie, dan logout antar-tab. Jangan jalankan tes backend yang membersihkan fixture database pada saat yang sama. Tanpa E2E_LIVE, test ini dilewati secara eksplisit.

Untuk memperbarui tipe API, jalankan `npm run build && npm run openapi && npm run api:types` dari backend, lalu format `src/lib/api/schema.d.ts` di frontend. CI frontend tidak memerlukan backend untuk build/check/test mock karena tipe hasil generasi disimpan dalam source.

## Lingkup pengembangan

Lihat [PRD](docs/product_requirement_document.md) dan [development plan](docs/development_plan.md). Foundation/auth tersedia; CRUD lowongan, dokumen, clearance vendor, dan ATS masuk tahap selanjutnya. Adapter masih adapter-auto; pilih adapter target hosting ketika deployment disepakati.
