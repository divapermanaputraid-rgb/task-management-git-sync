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
- backend log terkait:
  - `auth.login_failed`
  - `auth.session_unexpected_state`
  - `auth.user_lookup_failed`

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
- validation:
  - server hanya membaca field `name`, `description`, `startDate`, dan `endDate`
  - validasi utama memakai `createProjectSchema` di `src/lib/validations/project.ts`
  - `description` kosong dinormalisasi menjadi `null`
  - `startDate` dan `endDate` kosong dinormalisasi menjadi `null`
  - tanggal hanya diterima dalam format `YYYY-MM-DD`
  - tanggal kalender tidak valid dan range tanggal terbalik ditolak sebelum write database
- success log utama:
  - `project.created`
- reject log utama:
  - `project.create_forbidden`
  - `project.create_session_invalid`
  - `project.create_invalid_payload`
- failure log utama:
  - `project.create_failed`
- detail log tambahan:
  - reject payload invalid menyertakan `issueCount` dan `issueFields`
  - failure database memakai `reason` yang stabil dan field error aman dari helper logger

### `setProjectArchiveStateAction`

- lokasi: `src/app/(app)/projects/[projectId]/actions.ts`
- tujuan: archive atau unarchive project
- auth: wajib session valid
- permission: hanya `PM_ADMIN`
- enforcement: actor diambil dari session lalu role actor dimuat ulang dari database sebelum mutasi dijalankan
- validation:
  - server hanya membaca field `projectId` dan `nextStatus`
  - validasi shape payload memakai `toggleProjectArchiveSchema` di `src/lib/validations/project.ts`
  - status project saat ini dimuat ulang dari database lalu divalidasi lagi dengan helper transisi di `src/lib/projects/archive.ts`
  - transisi dengan status lama yang sama ditolak sebelum write database dijalankan
  - update status memakai guard pada status lama agar request stale atau double submit tidak dianggap sukses
- result handling:
  - success me-revalidate daftar dan detail project lalu redirect ke halaman detail project
  - reject yang masih berada dalam flow form dikembalikan sebagai `errorMessage` satu baris di surface archive project
- success log utama:
  - `project.archived`
  - `project.unarchived`
- reject log utama:
  - `project.archive_forbidden`
  - `project.archive_session_invalid`
  - `project.archive_invalid_payload`
  - `project.archive_missing`
  - `project.archive_invalid_state`
  - `project.archive_conflict`
- failure log utama:
  - `project.archive_lookup_failed`
  - `project.archive_failed`
- detail log tambahan:
  - reject payload invalid menyertakan `issueCount` dan `issueFields`
  - failure database memakai `reason` yang stabil dan field error aman dari helper logger

  ### `createTaskAction`

- lokasi: `src/app/(app)/projects/[projectId]/tasks/new/actions.ts`
- tujuan: membuat task backlog baru di dalam project aktif
- auth: wajib session valid
- permission: hanya `PM_ADMIN`
- enforcement: actor diambil dari session lalu role actor dimuat ulang dari database sebelum task dibuat
- validation:
  - server hanya membaca field `projectId`, `title`, `description`, `startDate`, dan `endDate`
  - validasi utama memakai `createTaskSchema` di `src/lib/validations/task.ts`
  - `description` kosong dinormalisasi menjadi `null`
  - timeline boleh kosong untuk task `BACKLOG`
  - jika salah satu tanggal timeline diisi, `startDate` dan `endDate` wajib diisi bersama
  - tanggal hanya diterima dalam format `YYYY-MM-DD`
  - tanggal kalender tidak valid dan range tanggal terbalik ditolak sebelum write database
- server-generated fields:
  - `code` dibuat server dengan format `TASK-N`
  - `sequenceNumber` diambil dari counter project
  - task baru selalu dibuat sebagai `BACKLOG`
- success log utama:
  - `task.created`
- reject log utama:
  - `task.create_forbidden`
  - `task.create_session_invalid`
  - `task.create_invalid_payload`
  - `task.create_project_missing`
  - `task.create_project_archived`
  - `task.create_conflict`
- failure log utama:
  - `task.create_failed`
- product activity:
  - `TASK_CREATED`

## Technical Debug Logging

Technical debug logging untuk repo ini memakai helper terpusat `src/lib/logger.ts`.

- tujuan: menyatukan shape log backend untuk auth, access guard, seed, dan server action sensitif
- field wajib:
  - `timestamp`
  - `level`
  - `event`
  - `area`
  - `action`
  - `result`
- field opsional yang umum:
  - `reason`
  - `actorUserId`
  - `role`
  - `projectId`
  - `taskId`
  - `repositoryConnectionId`
  - `detail`
- field error aman:
  - `errorName`
  - `errorMessage`
  - `errorCode`
- level yang dipakai:
  - `info` untuk mutasi penting yang berhasil
  - `warn` untuk reject, blocked access, atau payload invalid
  - `error` untuk failure database atau exception server
- batas keamanan:
  - jangan log password, token, cookie, secret, atau raw payload sensitif
  - pencarian event backend harus memakai field `event`, bukan string bebas di `message`
