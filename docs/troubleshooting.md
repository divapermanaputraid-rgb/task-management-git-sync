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

## Database Connection Issues

- pastikan host, port, user, dan password di `DATABASE_URL` benar
- pastikan jaringan atau firewall mengizinkan koneksi ke database
- jika koneksi ke pooler gagal, coba validasi ulang string koneksi dan SSL mode

