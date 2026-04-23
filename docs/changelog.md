# Changelog

Dokumen ini memakai log berbasis sprint, bukan versioning enterprise.

## Sprint 1

- menyiapkan baseline aplikasi Next.js untuk Internal Task Management
- membangun fondasi autentikasi berbasis email dan password
- menyiapkan role dasar `PM_ADMIN` dan `DEVELOPER`
- menyiapkan Prisma schema dan seed baseline user
- menyiapkan login entry dan redirect awal berdasarkan role

## Sprint 2

- menambahkan struktur shell aplikasi internal
- menyiapkan halaman awal `Dashboard`, `Projects`, `My Tasks`, dan `Settings`
- mengubah `Projects` dari placeholder menjadi browse surface awal berbasis role dan membership
- menyiapkan helper redirect login yang aman untuk callback lokal
- menambahkan fallback auth gate di layout grup `(app)` agar shell internal tidak dirender tanpa session valid
- merapikan fallback redirect login agar route asal aman tetap bisa dipertahankan
- menegaskan permission mutasi project di server untuk create, archive, dan unarchive
- memuat ulang actor dari database sebelum mutasi sensitif dijalankan
- menambahkan logging reject untuk permission dan invalid session pada action sensitif
- melengkapi dokumentasi operasional repo
- catch-up unit test hanya untuk helper pure yang stabil
- mengeraskan validasi create project di server dengan schema yang menormalisasi field opsional dan menolak tanggal tidak valid
- menambahkan field-level error state dan unit test untuk validasi create project
- mengeraskan flow archive dan unarchive project dengan validasi transisi berbasis status server
- menolak stale destructive mutation dan mengembalikan error state satu baris pada surface archive project
- menambahkan unit test untuk helper transisi archive project
- memusatkan technical debug logging backend melalui `src/lib/logger.ts`
- menyamakan auth, proxy, seed, dan mutasi project ke shape log terstruktur yang sama
- menambahkan unit test untuk output logger agar baseline logging tidak mudah regress
- menambahkan GitHub login sebagai provider tambahan tanpa mengganti baseline credentials
- menambahkan self-serve signup GitHub yang membuat user internal baru dengan role default `DEVELOPER`
- menambahkan linkage minimal `githubAccountId` pada user tanpa menambah adapter atau tabel `accounts`
- menjaga role dan authorization tetap berasal dari database internal setelah login GitHub
- menampilkan opsi login GitHub hanya saat konfigurasi OAuth sudah tersedia
