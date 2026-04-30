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
- event sukses seed yang diharapkan adalah `seed.completed`
- event gagal seed yang diharapkan adalah `seed.failed`

## Login/Auth Issues

- pastikan `NEXTAUTH_SECRET` terisi
- pastikan `NEXTAUTH_URL` sesuai URL lokal
- pastikan user seed sudah dibuat sebelum login
- jika login berhasil tetapi redirect salah, cek callback URL yang masuk dan pastikan masih path lokal
- jika verifikasi unauthenticated flow terasa aneh di browser biasa, gunakan incognito karena logout UI belum tersedia
- jika login ditolak, log reject yang umum adalah `auth.login_failed`
- jika lookup user gagal di backend, error log yang diharapkan adalah `auth.user_lookup_failed`

## GitHub OAuth Issues

- jika tombol GitHub tidak muncul, pastikan `GITHUB_ID` dan `GITHUB_SECRET` sudah terisi sebelum app dijalankan ulang
- jika callback GitHub gagal, pastikan callback URL di GitHub persis `${NEXTAUTH_URL}/api/auth/callback/github`
- jika deploy memakai domain publik, pastikan `NEXTAUTH_URL` memakai origin publik yang sama
- jika user GitHub baru berhasil login tetapi tidak melihat project, itu normal sampai membership ditambahkan
- jika identity GitHub bentrok, log reject yang diharapkan adalah `auth.github_signin_rejected`

## Route Protection Issues

- jika route internal masih bisa terbuka tanpa login, cek `src/proxy.ts` dan `src/app/(app)/layout.tsx`
- jika pengguna diarahkan ke login tetapi route asal hilang, cek helper di `src/lib/auth/redirects.ts`
- jika shell internal sempat tampil tanpa session, cek fallback auth gate di layout grup `(app)`
- jika request diblok tetapi jejak backend tidak terlihat, cari event `access.unauthorized`

## Permission Issues

- jika `DEVELOPER` terlihat ditolak di UI tetapi masih bisa memicu mutasi, cek server action terkait dan pastikan role diverifikasi di backend
- untuk create project, log reject permission yang diharapkan adalah `project.create_forbidden`
- untuk create project dengan payload invalid, log reject validation yang diharapkan adalah `project.create_invalid_payload`
- untuk archive atau unarchive project, log reject permission yang diharapkan adalah `project.archive_forbidden`
- jika actor session tidak lagi valid di database, log reject yang bisa muncul adalah `project.create_session_invalid` atau `project.archive_session_invalid`

## Task Create Issues

- jika `DEVELOPER` bisa membuat task, cek server action create task dan pastikan `canCreateTask` diverifikasi di backend
- jika task code tidak berurutan, cek `Project.taskCodeCounter` dan helper `formatTaskCode`
- jika project arsip masih bisa menerima task, cek reject path `task.create_project_archived`
- jika payload task invalid sulit dibaca, cek `issueCount` dan `issueFields` pada event `task.create_invalid_payload`
- jika task berhasil dibuat tetapi activity tidak muncul nanti, cek row `TASK_CREATED` di `task_activity_logs`

## Destructive Mutation Issues

- jika archive atau unarchive tidak jalan karena status project sebenarnya sudah sama, log reject yang diharapkan adalah `project.archive_invalid_state`
- jika dua tab mengirim perubahan status berurutan, request stale yang datang belakangan harus gagal dengan log `project.archive_conflict`
- jika hidden input `nextStatus` dimanipulasi, mutasi harus gagal dengan log `project.archive_invalid_payload`
- jika project target sudah tidak ada, reject yang diharapkan adalah `project.archive_missing`
- jika lookup status project gagal sebelum validasi selesai, error log yang diharapkan adalah `project.archive_lookup_failed`
- jika write status gagal, error log yang diharapkan adalah `project.archive_failed`

## Logging Issues

- jika pencarian log backend terasa tidak konsisten, cari berdasarkan field `event`
- jika log error terlihat tipis, pastikan caller memakai `logger.error(..., error)` dan bukan mengirim `error.message` manual ke context
- jika field seperti `projectId` atau `taskId` tidak muncul, itu berarti nilainya memang kosong dan sengaja dibuang helper logger
- jika payload invalid sulit dibaca, cek `issueCount` dan `issueFields` pada event reject
- jika kamu melihat kebutuhan histori user, jangan campur ke technical debug log karena itu harus tetap dipisahkan dari activity log produk

## Verification Issues

- gunakan `npm test` untuk helper auth redirect, logger, validasi create project, dan helper transisi archive project yang sudah punya unit test
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

## Deploy/Start Issues

- jika app gagal start di VPS, pastikan `NODE_ENV=production`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`, dan `DIRECT_URL` tersedia di process manager
- jika build berhasil tetapi login gagal di production, cek apakah `NEXTAUTH_URL` sama dengan origin publik aplikasi
- jika migration belum diterapkan, jalankan `npm run db:migrate:deploy` sebelum start aplikasi
- jika seed mengubah password akun baseline, pastikan `SEED_DEFAULT_PASSWORD` memang nilai yang ingin dipakai
- jika GitHub login gagal setelah deploy, cek ulang callback URL production di GitHub OAuth App

## Next.js Dev Issues

- jika `next dev` melaporkan port sudah dipakai, pakai proses yang sudah hidup atau matikan proses lama lalu jalankan ulang
- warning multiple lockfiles dari Turbopack bukan blocker aplikasi, tetapi sebaiknya dirapikan nanti dengan `turbopack.root` atau membersihkan lockfile yang tidak relevan
