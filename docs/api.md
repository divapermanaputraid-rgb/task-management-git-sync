# API

Dokumentasi ini hanya memuat route dan entry server yang sudah ada dan relevan untuk MVP saat ini.

## Auth Routes

### `POST /api/auth/callback/credentials`

- tujuan: memproses login credential untuk NextAuth
- auth: tidak perlu session awal
- request shape: `email`, `password`, serta parameter NextAuth yang dikirim client
- response shape: redirect atau payload kegagalan login dari NextAuth
- error umum:
  - kredensial tidak valid
  - email tidak ditemukan
  - password salah
  - session secret belum dikonfigurasi

### `GET /api/auth/session`

- tujuan: mengambil session aktif NextAuth
- auth: mengikuti cookie session yang ada
- request shape: tidak ada body
- response shape: JSON session atau `null`
- error umum:
  - session belum ada
  - cookie/session tidak valid

### `GET /api/auth/signin`

- tujuan: halaman atau entry sign-in dari NextAuth
- auth: tidak perlu session awal
- request shape: query string bawaan NextAuth
- response shape: form sign-in atau redirect internal
- error umum:
  - callback URL tidak valid
  - session sudah ada sehingga diarahkan ulang

### `GET /api/auth/signout`

- tujuan: mengakhiri session aktif NextAuth
- auth: session aktif
- request shape: tidak ada body
- response shape: redirect keluar sesi
- error umum:
  - session tidak ditemukan
  - cookie login tidak valid

## Server Actions

Repo ini saat ini juga memakai Next.js Server Actions untuk mutasi internal. Jalur ini bukan REST API publik, tetapi tetap menjadi entry backend yang wajib diproteksi.

### `createProjectAction`

- lokasi: `src/app/(app)/projects/new/actions.ts`
- tujuan: membuat project baru
- auth: wajib session valid
- permission: hanya `PM_ADMIN`
- enforcement: actor diambil dari session lalu role actor dimuat ulang dari database sebelum create dijalankan
- reject log utama:
  - `project.create_forbidden`
  - `project.create_session_invalid`

### `setProjectArchiveStateAction`

- lokasi: `src/app/(app)/projects/[projectId]/actions.ts`
- tujuan: archive atau unarchive project
- auth: wajib session valid
- permission: hanya `PM_ADMIN`
- enforcement: actor diambil dari session lalu role actor dimuat ulang dari database sebelum mutasi dijalankan
- reject log utama:
  - `project.archive_forbidden`
  - `project.archive_session_invalid`
  - `project.archive_invalid_payload`

Catatan: dokumentasi ini sengaja memisahkan auth routes dan server actions supaya entry backend yang sensitif tetap terlihat jelas saat audit security dilakukan.
