# API

Dokumentasi ini hanya memuat route yang sudah ada dan relevan untuk MVP saat ini.

## `POST /api/auth/callback/credentials`

- tujuan: memproses login credential untuk NextAuth
- auth: tidak perlu session awal
- request shape: `email`, `password`, serta parameter NextAuth yang dikirim client
- response shape: redirect atau payload kegagalan login dari NextAuth
- error umum:
  - kredensial tidak valid
  - email tidak ditemukan
  - password salah
  - session secret belum dikonfigurasi

## `GET /api/auth/session`

- tujuan: mengambil session aktif NextAuth
- auth: mengikuti cookie session yang ada
- request shape: tidak ada body
- response shape: JSON session atau `null`
- error umum:
  - session belum ada
  - cookie/session tidak valid

## `GET /api/auth/signin`

- tujuan: halaman/entry sign-in dari NextAuth
- auth: tidak perlu session awal
- request shape: query string bawaan NextAuth
- response shape: form sign-in atau redirect internal
- error umum:
  - callback URL tidak valid
  - session sudah ada sehingga diarahkan ulang

## `GET /api/auth/signout`

- tujuan: mengakhiri session aktif NextAuth
- auth: session aktif
- request shape: tidak ada body
- response shape: redirect keluar sesi
- error umum:
  - session tidak ditemukan
  - cookie login tidak valid

Catatan: route auth di atas mengikuti perilaku bawaan NextAuth yang sudah terpasang di app, jadi detail payload dapat berubah sesuai mekanisme library.

