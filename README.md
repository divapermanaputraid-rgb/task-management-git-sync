# Internal Task Management

Sistem manajemen tugas internal untuk software house. Repo ini menjadi MVP yang fokus pada alur kerja inti: login, role-aware entry, navigasi project, dan fondasi data tugas.

## Tujuan Sistem

- membantu tim internal melihat konteks kerja secara terpusat
- memisahkan entry pengguna berdasarkan role
- menyiapkan dasar untuk pengelolaan project, task, dan aktivitas kerja

## User Role

- `PM_ADMIN`: masuk ke dashboard, melihat ringkasan workspace, dan mengelola project secara umum
- `DEVELOPER`: masuk ke halaman `My Tasks`, fokus ke tugas yang ditugaskan

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma
- PostgreSQL
- NextAuth
- Tailwind CSS 4

## Quick Start

1. Salin `.env.example` menjadi `.env` dan isi semua nilai yang dibutuhkan.
2. Install dependency:
   ```bash
   npm install
   ```
3. Generate client Prisma:
   ```bash
   npm run db:generate
   ```
4. Jalankan migrasi database:
   ```bash
   npm run db:migrate:deploy
   ```
5. Jalankan seed baseline:
   ```bash
   npm run db:seed
   ```
6. Jalankan app lokal:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/app/` - App Router pages, layouts, dan route handler
- `src/lib/` - helper autentikasi, validasi, database, dan utility
- `src/components/` - komponen reusable untuk shell dan tampilan umum
- `prisma/` - schema, migrasi, dan seed
- `docs/` - dokumentasi operasional proyek

