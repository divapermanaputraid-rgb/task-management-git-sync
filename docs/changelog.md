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
