# Status implementasi foundation dan auth

Tanggal: 27 Oktober 2026.

## Tersedia

- Backend NestJS modular dengan PostgreSQL/Prisma, migrasi awal, validasi environment, OpenAPI, request ID, error terstruktur, health/readiness, Helmet, CORS dan rate limiting.
- Registrasi kandidat/vendor pending; login Argon2id + JWT access token; refresh token HttpOnly berotasi dengan deteksi reuse dan revokasi sesi.
- Verifikasi email, kirim ulang, reset password sekali pakai, transactional email outbox, dan pencabutan sesi lain.
- Role/permission backend, pengecekan status akun dan permission terbaru pada setiap request, provisioning superadmin melalui stdin dan undangan staf oleh superadmin.
- Alur Google authorization code + state/cookie browser + nonce + PKCE; provider UI tidak aktif tanpa konfigurasi. Kredensial Google nyata tidak tersedia dalam sesi implementasi.
- Frontend SvelteKit 3/Svelte 5: landing prerender, login, register, forgot/reset password, verifikasi email, callback Google, dashboard internal, shell kandidat/vendor, dan akun/sesi.
- Area aplikasi `ssr=false`; request API dari browser. Dashboard overview/staf dan mutation undangan menggunakan TanStack Query Svelte 6; auth bootstrap memakai QueryClient.
- JWT access token di localStorage, single-flight refresh, Web Locks untuk koordinasi antar-tab, pembersihan cache privat, role redirect, timeout/abort, dan logout lintas tab.
- Tipe user/token/overview dari schema OpenAPI hasil generasi; CI frontend/backend dan petunjuk setup tersedia di README masing-masing.

## Hasil verifikasi

- Backend lint, typecheck dan build lulus; 12 integration tests menggunakan PostgreSQL nyata lulus. Mencakup RBAC, role injection, hashing, refresh/reuse, revokasi, reset/verifikasi single-use, undangan staf, OAuth state/PKCE, field validation, dan rate limit.
- Frontend lint/typecheck lulus; 6 unit tests lulus (5 auth-client dan 1 starter test).
- Build production lulus. Playwright suite standar: 5 lulus (4 auth/UI dan 1 starter), 1 live smoke dilewati secara eksplisit bila E2E_LIVE tidak diisi.
- Live smoke dijalankan terpisah terhadap NestJS + PostgreSQL asli dan lulus: login, JWT localStorage, CSR overview, reload, refresh cookie, logout antar-tab.
- HTML awal admin tidak mengandung data dashboard; query admin tidak dijalankan oleh browser anonim. Tampilan desktop diperiksa melalui screenshot; login mobile diuji tanpa overflow horizontal.
- Svelte autofixer tidak menemukan issue. Saran generik pada effect navigasi ditinjau: fungsi membangun URL dan melakukan navigasi, sehingga efek tersebut memang side effect, bukan nilai turunan.

## Konfigurasi dan batas yang masih berlaku

- Isi SMTP dan Google OAuth milik deployment. Email outbox/token diuji pada database; pengiriman melalui provider SMTP nyata dan login Google nyata belum diuji dengan kredensial deployment.
- Database development dipisahkan dari database `_test`, agar pembersihan fixture test tidak menghapus akun development. Workspace memakai PostgreSQL sementara di port 55432; gunakan penyimpanan permanen/Compose untuk pengembangan berkelanjutan.
- Tidak ada superadmin/password default pada database development. Ikuti `admin:create` di README backend untuk membuat akun sendiri.
- Role/permission masih matriks bawaan. Pengaturan role dinamis, CRUD lowongan, S3/upload dokumen, clearance vendor dan ATS mengikuti tahap selanjutnya.
- Worker email dan rate limiter ditujukan untuk satu instance MVP. Production memerlukan provider terkonfigurasi, adapter hosting yang dipilih, backup/restore, housekeeping/retensi, dan UAT.
