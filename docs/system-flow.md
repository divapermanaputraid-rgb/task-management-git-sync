# System Flow

Dokumen ini hanya mencatat alur yang sudah ada di repo saat ini.

## Login Flow

1. Pengguna membuka `/login`.
2. Jika sesi belum ada, pengguna melihat login credentials dan opsi GitHub bila OAuth sudah dikonfigurasi.
3. Saat kredensial valid, NextAuth membuat session berbasis JWT dari user internal yang sudah ada.
4. Saat GitHub sign-in berhasil, sistem mencari linkage provider lebih dulu lalu:
   - memakai user internal yang sudah ter-link
   - menghubungkan user internal yang email-nya cocok
   - atau membuat user internal baru dengan role `DEVELOPER`
5. User baru hasil GitHub signup tidak otomatis menjadi member project mana pun.
6. Jika identitas GitHub tidak lengkap atau linkage bentrok, sign-in ditolak bersih.
7. Setelah login, sistem mengarahkan pengguna ke tujuan yang aman:
   - callback URL yang valid jika ada
   - fallback ke route default berdasarkan role

## Route Protection Flow

1. Route internal dilindungi lebih dulu oleh `src/proxy.ts`.
2. Jika request tidak punya session, pengguna diarahkan ke `/login`.
3. Request tanpa session dicatat sebagai event `access.unauthorized` dengan path route yang diblok.
4. Jika request masuk ke grup route internal `(app)`, `src/app/(app)/layout.tsx` tetap memverifikasi session lagi sebelum shell dirender.
5. Redirect login memakai callback URL lokal yang aman agar pengguna bisa kembali ke route asal setelah login.

## Role-Aware Entry Flow

- `PM_ADMIN` diarahkan ke `/dashboard`
- `DEVELOPER` diarahkan ke `/my-tasks`
- jika pengguna sudah login lalu membuka `/login`, sistem tetap mengarahkan ke tujuan yang sesuai dan tidak kembali ke halaman login

## Project Browse Flow

1. Pengguna login dan masuk ke shell aplikasi.
2. Dari navigasi, pengguna membuka halaman `Projects`.
3. Sistem mengambil project berdasarkan role dan membership pengguna.
4. `PM_ADMIN` melihat semua project yang sesuai filter.
5. `DEVELOPER` hanya melihat project yang memang menjadi membership-nya.
6. Halaman menampilkan ringkasan jumlah project, tugas aktif, dan repository.
7. Setiap project bisa dibuka ke halaman detail melalui route `/projects/[projectId]`.

## Project Mutation Permission Flow

1. Halaman `Projects` hanya menampilkan tombol `Buat Project` untuk `PM_ADMIN`.
2. Halaman detail project hanya menampilkan kontrol archive untuk `PM_ADMIN`.
3. Server action tetap memverifikasi actor dari session dan memuat ulang role actor dari database sebelum mutasi dijalankan.
4. `DEVELOPER` tetap ditolak walaupun request dimanipulasi manual dari browser.
5. Penolakan permission dicatat ke log backend dengan event yang stabil agar audit server tetap jelas.

## Project Archive Validation Flow

1. Halaman detail project merender form archive atau unarchive khusus route untuk `PM_ADMIN`.
2. Server action hanya membaca field `projectId` dan `nextStatus` dari `FormData`.
3. Actor tetap dimuat ulang dari database sebelum perubahan status dijalankan.
4. Status project saat ini dimuat ulang dari database lalu divalidasi agar transisi `ACTIVE -> ACTIVE` dan `ARCHIVED -> ARCHIVED` ditolak dengan jelas.
5. Write status memakai update bersyarat pada status lama agar double submit atau stale tab tidak diam-diam menimpa state terbaru.
6. Payload invalid, transisi invalid, dan stale mutation dikembalikan sebagai error satu baris di form serta dicatat ke log backend.
7. Reject payload invalid menyertakan `issueFields` agar debugging field yang rusak tetap cepat tanpa membocorkan seluruh payload.

## Project Create Validation Flow

1. Form `Projects / New` hanya mengirim field `name`, `description`, `startDate`, dan `endDate`.
2. Server action tetap membaca field secara whitelist dari `FormData` dan tidak mempercayai field lain dari client.
3. `createProjectSchema` men-trim input teks, mengubah field opsional kosong menjadi `null`, dan hanya menerima tanggal dengan format `YYYY-MM-DD`.
4. Tanggal kalender yang tidak valid, format tanggal yang tidak sesuai, dan range tanggal terbalik ditolak sebelum write Prisma dijalankan.
5. Payload invalid dikembalikan ke form sebagai field-level error dan dicatat ke log backend sebagai `project.create_invalid_payload`.
6. Reject payload invalid menyertakan `issueFields` agar field yang gagal bisa dibaca langsung dari log backend.
7. Payload valid baru diteruskan ke Prisma untuk membuat project dan redirect ke detail project.

## Technical Debug Logging Flow

1. Auth, proxy, seed, dan server action sensitif mengirim log lewat `src/lib/logger.ts`.
2. Caller wajib mengirim `event` serta context minimum seperti `area`, `action`, dan `result`.
3. Helper logger menambahkan `timestamp` dan `level` secara terpusat.
4. Jika ada exception, helper logger hanya menurunkan field error aman seperti `errorName`, `errorMessage`, dan `errorCode`.
5. Field opsional yang kosong dibuang dari output agar log tetap rapih dan tidak penuh noise `null`.
6. Technical debug log tetap terpisah dari product activity log dan tidak disimpan ke surface histori user.

## Current Sensitive Actions

Saat ini mutasi sensitif yang sudah ada di repo adalah:

- create project
- archive project
- unarchive project

Semua mutasi di atas sudah diproteksi di server dan tidak hanya bergantung pada UI.
