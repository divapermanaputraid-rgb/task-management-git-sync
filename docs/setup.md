# Setup

Panduan ini fokus ke setup lokal dan alur database yang benar untuk MVP saat ini.

## Instalasi

1. Pastikan Node.js dan PostgreSQL sudah tersedia.
2. Install dependency:
   ```bash
   npm install
   ```
3. Salin `.env.example` menjadi `.env`.
4. Isi variabel environment yang dibutuhkan.

## Environment Variables

Wajib:

- `DATABASE_URL` - dipakai aplikasi runtime dan seed
- `DIRECT_URL` - dipakai Prisma CLI untuk migrate deploy/status
- `NEXTAUTH_SECRET` - rahasia untuk session NextAuth
- `NEXTAUTH_URL` - URL aplikasi lokal, biasanya `http://localhost:3000`
- `SEED_DEFAULT_PASSWORD` - password baseline untuk user seed

Opsional tetapi dibutuhkan untuk GitHub login:

- `GITHUB_ID` - client id dari GitHub OAuth App
- `GITHUB_SECRET` - client secret dari GitHub OAuth App

Opsional:

- `SHADOW_DATABASE_URL` - hanya diperlukan jika nanti menjalankan `prisma migrate dev` dengan shadow database terpisah

## Database Setup

1. Pastikan database target sudah bisa diakses dari `DATABASE_URL`.
2. Generate Prisma client:
   ```bash
   npm run db:generate
   ```
3. Jalankan migrasi yang sudah ada:
   ```bash
   npm run db:migrate:deploy
   ```

## Migration Flow

- gunakan `npm run db:migrate:status` untuk mengecek status migrasi
- gunakan `npm run db:migrate:deploy` untuk menerapkan migrasi yang sudah ada ke database tujuan
- gunakan `npm run db:migrate:dev:local` hanya saat membuat migrasi baru di lingkungan lokal

## Seed Flow

Seed saat ini hanya menyiapkan baseline user auth.

```bash
npm run db:seed
```

Seed akan membuat atau memperbarui akun berikut:

- `pmadmin@newus.com`
- `dev1@newus.com`
- `dev2@newus.com`

Semua akun seed memakai password yang diambil dari `SEED_DEFAULT_PASSWORD`.

## GitHub OAuth Setup

1. Buat GitHub OAuth App dari GitHub Developer Settings.
2. Isi `Homepage URL` dengan `http://localhost:3000`.
3. Isi `Authorization callback URL` dengan `http://localhost:3000/api/auth/callback/github`.
4. Salin client id ke `GITHUB_ID`.
5. Salin client secret ke `GITHUB_SECRET`.

GitHub login hanya muncul jika `GITHUB_ID` dan `GITHUB_SECRET` sudah diisi.
