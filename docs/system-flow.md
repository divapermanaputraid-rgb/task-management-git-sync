# System Flow

Dokumen ini hanya mencatat alur yang sudah ada di repo saat ini.

## Login Flow

1. Pengguna membuka `/login`.
2. Jika sesi belum ada, pengguna melihat form login.
3. Saat kredensial valid, NextAuth membuat session berbasis JWT.
4. Setelah login, sistem mengarahkan pengguna ke tujuan yang aman:
   - callback URL yang valid jika ada
   - fallback ke route default berdasarkan role

## Role-Aware Entry Flow

- `PM_ADMIN` diarahkan ke `/dashboard`
- `DEVELOPER` diarahkan ke `/my-tasks`
- jika pengguna sudah login lalu membuka `/login`, sistem tetap mengarahkan ke tujuan yang sesuai dan tidak kembali ke halaman login

## Project Browse Flow

1. Pengguna login dan masuk ke shell aplikasi.
2. Dari navigasi, pengguna membuka halaman `Projects`.
3. Halaman detail project menerima `projectId` dari route.
4. Saat ini halaman project masih berupa konteks placeholder yang menyiapkan ruang untuk ringkasan dan board project.

