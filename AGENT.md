# AGENT.md — Aturan Kerja Project

> File ini HARUS dibaca di awal setiap sesi kerja sebelum menyentuh kode.

## 1. Tujuan Project

Project ini adalah backend (dan frontend) website penjualan tiket event. User bisa melihat daftar event, membeli tiket, dan mengelola tiket mereka. Sistem juga menyediakan panel untuk mengelola event dan penjualan (untuk penyelenggara).

## 2. Stack dan Versi

| Teknologi | Versi / Keterangan |
| --- | --- |
| Next.js | App Router + TypeScript (Route Handlers untuk backend, React untuk frontend, 1 project) |
| Supabase | Postgres + Auth |
| Deploy | Vercel |

> Catatan: versi pasti dicek di `package.json` sebelum memasang dependensi baru.

## 3. Aturan Kode

- **Bahasa penjelasan dan komentar:** Bahasa Indonesia, sederhana.
- **Setiap file diawali komentar singkat:** `// File ini berfungsi untuk ...`
- **Setiap fungsi diberi komentar:** tujuan, input, output.
- **Bagian logika penting diberi komentar "kenapa",** bukan hanya "apa".
- **Nama variabel jelas dan deskriptif,** tidak disingkat.
- **Kode sederhana lebih diutamakan daripada kode "pintar".** Jangan pakai pola rumit: tidak perlu DI container, tidak perlu abstraksi berlapis.
- **Satu fungsi hanya mengerjakan satu hal.**

## 4. Aturan Keamanan

- Validasi input di backend dengan **zod**.
- Jangan pernah hardcode secret. Gunakan **`.env`** (dan `.env.example` untuk dokumentasi tanpa nilai rahasia).
- Jangan pernah kirim **`SUPABASE_SERVICE_ROLE_KEY`** ke frontend. Key itu hanya untuk kode server (Route Handlers / Server Actions).

## 5. Aturan Kerja

- Kerjakan **HANYA fase** yang diminta.
- Sebelum menulis kode, **tampilkan rencana singkat**: file apa saja yang dibuat/diubah.
- Setelah selesai, tulis **ringkasan**: apa yang dibuat, cara menjalankan, cara mengetesnya.
- Jika ada keputusan yang **ambigu, tanya dulu**, jangan menebak.
- **Jangan menambah library baru** tanpa menjelaskan alasannya.
- **Jangan menghapus kode** yang tidak diminta.

## 6. Dokumen Acuan

Baca dokumen berikut sebelum coding:

- `docs/PRD.md`
- `docs/architecture.md`
- `docs/data-model.md`
- `docs/api-contract.md`
- `docs/order-flow.md`
- `docs/permission.md`
- `docs/logging.md`
- `docs/clean-dead-code.md`

## 7. Definition of Done (Tiap Fase)

Sebuah fase dianggap selesai jika:

1. Berjalan tanpa error.
2. Lolos lint & typecheck.
3. Sudah ada komentar sesuai aturan di bagian 3.
4. Dokumen terkait diperbarui jika ada perubahan.
