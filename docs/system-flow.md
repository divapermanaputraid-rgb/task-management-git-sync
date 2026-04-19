# System Flow

Dokumen ini hanya mencatat alur yang sudah ada di repo saat ini.

## Login Flow

1. Pengguna membuka `/login`.
2. Jika sesi belum ada, pengguna melihat form login.
3. Saat kredensial valid, NextAuth membuat session berbasis JWT.
4. Setelah login, sistem mengarahkan pengguna ke tujuan yang aman:
   - callback URL yang valid jika ada
   - fallback ke route default berdasarkan role

## Route Protection Flow

1. Route internal dilindungi lebih dulu oleh `src/proxy.ts`.
2. Jika request tidak punya session, pengguna diarahkan ke `/login`.
3. Jika request masuk ke grup route internal `(app)`, `src/app/(app)/layout.tsx` tetap memverifikasi session lagi sebelum shell dirender.
4. Redirect login memakai callback URL lokal yang aman agar pengguna bisa kembali ke route asal setelah login.

## Role-Aware Entry Flow

- `PM_ADMIN` diarahkan ke `/dashboard`
- `DEVELOPER` diarahkan ke `/my-tasks`
- jika pengguna sudah login lalu membuka `/login`, sistem tetap mengarahkan ke tujuan yang sesuai dan tidak kembali ke halaman login

## Project Browse Flow

1. Pengguna login dan masuk ke shell aplikasi.
2. Dari navigasi, pengguna membuka halaman `Projects`.
3. Sistem mengambil project berdasarkan role dan membership pengguna.
4. `PM_ADMIN` melihat semua project yang sesuai filter.
5. `DEVELOPER` hanya melihat project yang memang menjadi membership-nya.
6. Halaman menampilkan ringkasan jumlah project, tugas aktif, dan repository.
7. Setiap project bisa dibuka ke halaman detail melalui route `/projects/[projectId]`.

## Project Mutation Permission Flow

1. Halaman `Projects` hanya menampilkan tombol `Buat Project` untuk `PM_ADMIN`.
2. Halaman detail project hanya menampilkan kontrol archive untuk `PM_ADMIN`.
3. Server action tetap memverifikasi actor dari session dan memuat ulang role actor dari database sebelum mutasi dijalankan.
4. `DEVELOPER` tetap ditolak walaupun request dimanipulasi manual dari browser.
5. Penolakan permission dicatat ke log backend agar audit server tetap jelas.

## Current Sensitive Actions

Saat ini mutasi sensitif yang sudah ada di repo adalah:

- create project
- archive project
- unarchive project

Semua mutasi di atas sudah diproteksi di server dan tidak hanya bergantung pada UI.
