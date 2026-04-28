# Setup

Panduan ini fokus ke setup lokal, database, seed, dan baseline deploy MVP saat ini.

## Prasyarat

- Node.js dan npm tersedia.
- PostgreSQL tersedia; default arah deployment memakai PostgreSQL hosted di Supabase.
- GitHub OAuth App hanya dibutuhkan jika login GitHub ingin diaktifkan.

## Instalasi Lokal

1. Install dependency:
   ```bash
   npm install
   ```
2. Salin `.env.example` menjadi `.env`.
3. Isi variabel environment yang dibutuhkan.
4. Generate Prisma client:
   ```bash
   npm run db:generate
   ```
5. Jalankan migrasi yang sudah ada:
   ```bash
   npm run db:migrate:deploy
   ```
6. Jalankan seed jika butuh akun baseline:
   ```bash
   npm run db:seed
   ```
7. Jalankan app lokal:
   ```bash
   npm run dev
   ```

## Environment Variables

Wajib untuk runtime dan database:

- `DATABASE_URL` - dipakai aplikasi runtime dan seed.
- `DIRECT_URL` - dipakai Prisma CLI untuk migrate deploy/status.
- `NEXTAUTH_SECRET` - rahasia untuk session NextAuth.
- `NEXTAUTH_URL` - origin aplikasi, misalnya `http://localhost:3000` untuk lokal.
- `SEED_DEFAULT_PASSWORD` - hanya wajib saat menjalankan seed baseline.

Runtime process:

- `NODE_ENV` - biasanya diatur oleh Next.js, npm script, atau process manager.
- Untuk VPS production, set `NODE_ENV=production` di process manager, bukan sebagai nilai lokal yang asal disalin.

Opsional tetapi dibutuhkan untuk GitHub login:

- `GITHUB_ID` - client id dari GitHub OAuth App.
- `GITHUB_SECRET` - client secret dari GitHub OAuth App.

Opsional untuk membuat migration baru:

- `SHADOW_DATABASE_URL` - hanya diperlukan jika `prisma migrate dev` membutuhkan shadow database terpisah.

## Database Setup

1. Pastikan `DATABASE_URL` bisa dipakai aplikasi untuk koneksi runtime.
2. Pastikan `DIRECT_URL` mengarah ke database yang benar untuk Prisma migration.
3. Jalankan:
   ```bash
   npm run db:migrate:status
   ```
4. Terapkan migration yang sudah ada:
   ```bash
   npm run db:migrate:deploy
   ```

Untuk Supabase, `DATABASE_URL` dan `DIRECT_URL` boleh berbeda sesuai connection string yang dipakai untuk runtime dan migration.

## Migration Flow

- Gunakan `npm run db:migrate:status` untuk mengecek status migrasi.
- Gunakan `npm run db:migrate:deploy` untuk menerapkan migrasi yang sudah ada ke database tujuan.
- Gunakan `npm run db:migrate:dev:local` hanya saat membuat migrasi baru di lingkungan lokal.
- Jangan gunakan `migrate dev` untuk database production.

## Seed Flow

Seed saat ini hanya menyiapkan baseline user auth.

```bash
npm run db:seed
```

Seed akan membuat atau memperbarui akun berikut:

- `pmadmin@newus.com`
- `dev1@newus.com`
- `dev2@newus.com`

Semua akun seed memakai password dari `SEED_DEFAULT_PASSWORD`.

Seed tidak otomatis dijalankan saat deploy; jalankan hanya saat memang butuh akun baseline.

## GitHub OAuth Setup

1. Buat GitHub OAuth App dari GitHub Developer Settings.
2. Untuk lokal, isi `Homepage URL` dengan `http://localhost:3000`.
3. Untuk lokal, isi `Authorization callback URL` dengan `http://localhost:3000/api/auth/callback/github`.
4. Untuk VPS, ganti origin callback sesuai `NEXTAUTH_URL`, misalnya `https://domainmu.com/api/auth/callback/github`.
5. Salin client id ke `GITHUB_ID`.
6. Salin client secret ke `GITHUB_SECRET`.

GitHub login hanya muncul jika `GITHUB_ID` dan `GITHUB_SECRET` sudah diisi sebelum app dijalankan.

## VPS Deploy Baseline

1. Siapkan environment variables di process manager atau platform deploy.
2. Install dependency:
   ```bash
   npm ci
   ```
3. Generate Prisma client:
   ```bash
   npm run db:generate
   ```
4. Terapkan migration:
   ```bash
   npm run db:migrate:deploy
   ```
5. Jalankan seed hanya jika butuh akun baseline:
   ```bash
   npm run db:seed
   ```
6. Build app:
   ```bash
   npm run build
   ```
7. Jalankan app:
   ```bash
   npm run start
   ```

Pastikan `NEXTAUTH_URL` di VPS memakai origin production dan process manager menjalankan app dengan `NODE_ENV=production`.

## Sanity Check

- Buka `/login`.
- Login dengan akun seed jika seed dijalankan.
- Pastikan `PM_ADMIN` masuk ke dashboard.
- Pastikan `DEVELOPER` masuk ke `My Tasks`.
- Jika GitHub OAuth diaktifkan, pastikan callback URL di GitHub sama dengan `NEXTAUTH_URL`.
- Buka route internal tanpa session dan pastikan diarahkan ke `/login`.
