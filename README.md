# Ticket Event

Backend + frontend website penjualan tiket event. Satu project Next.js
(App Router + TypeScript) yang berbicara ke Supabase (Postgres + Auth).

> Status: **Setup awal**. Belum ada fitur bisnis, baru kerangka project,
> koneksi Supabase, helper response/log, dan endpoint tes `/api/health`.

## Teknologi

| Teknologi | Keterangan |
| --- | --- |
| Next.js (App Router) | Frontend (React) + backend (Route Handlers) dalam satu project |
| TypeScript | Tipe statis |
| Tailwind CSS | Styling |
| Supabase | Postgres + Auth + RLS |
| Zod | Validasi input di backend |

## Library Tambahan & Fungsinya

- **@supabase/supabase-js** — client resmi Supabase untuk mengakses database/auth (dipakai oleh client service role).
- **@supabase/ssr** — helper membuat client Supabase yang benar untuk server/client Next.js (menangani sesi lewat cookie).
- **zod** — validasi skema input di backend sesuai aturan keamanan.
- **qrcode** — membuat gambar/kode QR untuk e-ticket.

## Prasyarat

- Node.js 20+ (disarankan)
- npm
- Akun Supabase

## Cara Install

```bash
npm install
```

## Cara Mengisi `.env.local`

1. Salin contoh env menjadi file lokal:

   ```bash
   copy .env.example .env.local
   ```

   (macOS/Linux: `cp .env.example .env.local`)

2. Buka `.env.local`, lalu ambil nilai dari dashboard Supabase
   (**Settings > API**):
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` → service_role key (rahasia, server saja)

3. Isi juga `PAYMENT_WEBHOOK_SECRET` dan `CRON_SECRET` dengan token acak panjang,
   serta `PAYMENT_MODE=simulation` untuk MVP.

> `.env.local` tidak akan pernah di-commit (ada di `.gitignore`).
> Jangan pernah menaruh `SUPABASE_SERVICE_ROLE_KEY` di variabel `NEXT_PUBLIC_*`.

## Cara Menjalankan

```bash
npm run dev
```

Buka http://localhost:3000.

## Cara Mengetes

```bash
npm run lint
npx tsc --noEmit
```

Endpoint tes kesehatan:

```bash
curl http://localhost:3000/api/health
```

Response yang diharapkan:

```json
{ "success": true, "data": { "status": "OK", "timestamp": "..." }, "error": null }
```

## Struktur Folder (ringkas)

```text
app/
├─ (public)/events        halaman publik (daftar & detail event)
├─ (auth)                 halaman registrasi & login
├─ account                profil, riwayat pesanan, e-ticket
├─ admin                  dashboard admin
└─ api/                   Route Handlers (backend)
   ├─ health              endpoint tes (sudah ada)
   └─ auth, events, orders, payments, ... (placeholder struktur)
components/               komponen React yang dipakai ulang
lib/
├─ supabase/
│  ├─ browser.ts          client browser (anon key)
│  ├─ server.ts           client server (anon key + cookie)
│  └─ admin.ts            client server (service role) — JANGAN di browser
├─ api-response.ts        helper response standar { success, data, error }
├─ logger.ts              application log (JSON satu baris)
├─ validators/            skema zod (placeholder)
└─ services/              logika bisnis (placeholder)
```

## Dokumen Acuan

Detail arsitektur, kontrak API, model data, dan aturan kerja ada di folder `docs/`
dan `AGENT.md`.
