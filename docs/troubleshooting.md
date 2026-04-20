# Troubleshooting

Panduan singkat untuk masalah yang paling mungkin muncul di repo ini.

## Env Issues

- pastikan `.env` sudah ada
- cek `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, dan `SEED_DEFAULT_PASSWORD`
- jika password database mengandung karakter khusus, pastikan sudah URL-encoded

## Migration Issues

- cek status migrasi dengan:
  ```bash
  npm run db:migrate:status
  ```
- jika deploy migrasi gagal, periksa apakah `DIRECT_URL` mengarah ke database yang benar
- jangan pakai `migrate dev` di database produksi

## Seed Issues

- pastikan `SEED_DEFAULT_PASSWORD` terisi
- pastikan `DATABASE_URL` valid dan database bisa diakses
- seed akan gagal jika Prisma tidak bisa terhubung ke database target

## Login/Auth Issues

- pastikan `NEXTAUTH_SECRET` terisi
- pastikan `NEXTAUTH_URL` sesuai URL lokal
- pastikan user seed sudah dibuat sebelum login
- jika login berhasil tetapi redirect salah, cek callback URL yang masuk dan pastikan masih path lokal
- jika verifikasi unauthenticated flow terasa aneh di browser biasa, gunakan incognito karena logout UI belum tersedia

## Route Protection Issues

- jika route internal masih bisa terbuka tanpa login, cek `src/proxy.ts` dan `src/app/(app)/layout.tsx`
- jika pengguna diarahkan ke login tetapi route asal hilang, cek helper di `src/lib/auth/redirects.ts`
- jika shell internal sempat tampil tanpa session, cek fallback auth gate di layout grup `(app)`

## Permission Issues

- jika `DEVELOPER` terlihat ditolak di UI tetapi masih bisa memicu mutasi, cek server action terkait dan pastikan role diverifikasi di backend
- untuk create project, log reject permission yang diharapkan adalah `project.create_forbidden`
- untuk create project dengan payload invalid, log reject validation yang diharapkan adalah `project.create_invalid_payload`
- untuk archive atau unarchive project, log reject permission yang diharapkan adalah `project.archive_forbidden`
- jika actor session tidak lagi valid di database, log reject yang bisa muncul adalah `project.create_session_invalid` atau `project.archive_session_invalid`

## Destructive Mutation Issues

- jika archive atau unarchive tidak jalan karena status project sebenarnya sudah sama, log reject yang diharapkan adalah `project.archive_invalid_state`
- jika dua tab mengirim perubahan status berurutan, request stale yang datang belakangan harus gagal dengan log `project.archive_conflict`
- jika hidden input `nextStatus` dimanipulasi, mutasi harus gagal dengan log `project.archive_invalid_payload`
- jika project target sudah tidak ada, reject yang diharapkan adalah `project.archive_missing`
- jika lookup status project gagal sebelum validasi selesai, error log yang diharapkan adalah `project.archive_lookup_failed`

## Verification Issues

- gunakan `npm test` untuk helper auth redirect, validasi create project, dan helper transisi archive project yang sudah punya unit test
- gunakan `npm run lint` untuk memastikan perubahan tetap bersih
- gunakan `npx tsc --noEmit` untuk memastikan flow action dan form state tetap aman secara tipe
- untuk negative test permission, copy request sukses dari Network browser lalu replay saat login sebagai `DEVELOPER`
- untuk negative test stale mutation, buka detail project yang sama di dua tab lalu submit archive atau unarchive dari kedua tab secara berurutan
- untuk negative test invalid transition, kirim ulang request lama setelah status project sudah berubah
- untuk negative test payload, ubah `nextStatus` di DevTools ke nilai yang tidak valid lalu submit form
- hasil yang benar adalah mutasi gagal, status project tidak berubah, dan log backend mencatat reject yang sesuai dengan kasusnya

## Database Connection Issues

- pastikan host, port, user, dan password di `DATABASE_URL` benar
- pastikan jaringan atau firewall mengizinkan koneksi ke database
- jika koneksi ke pooler gagal, coba validasi ulang string koneksi dan SSL mode

## Next.js Dev Issues

- jika `next dev` melaporkan port sudah dipakai, pakai proses yang sudah hidup atau matikan proses lama lalu jalankan ulang
- warning multiple lockfiles dari Turbopack bukan blocker aplikasi, tetapi sebaiknya dirapikan nanti dengan `turbopack.root` atau membersihkan lockfile yang tidak relevan
