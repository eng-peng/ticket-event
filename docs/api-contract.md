# API Contract — Perjanjian Endpoint REST

> Dokumen ini adalah **perjanjian** antara frontend dan backend: daftar endpoint REST di
> `app/api/*`, siapa yang boleh akses, contoh request/response, dan daftar error.
> Frontend dan backend harus mengikuti dokumen ini supaya tidak saling salah paham.
>
> Penentu hak akses (siapa boleh apa) ada di `docs/permission.md`.
> Struktur tabel database ada di `docs/data-model.md`.

---

## 1. Format Response Standar

SETIAP response endpoint memakai satu bentuk saja:

```json
{
  "success": true,
  "data": { "apaSaja": "..." },
  "error": null
}
```

Kalau gagal, gunakan bentuk ini (dan HTTP status sesuai jenis error):

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Event tidak ditemukan."
  }
}
```

Aturan:

- `success` selalu ada (`true`/`false`).
- Kalau `success = true`, `error` harus `null`.
- Kalau `success = false`, `data` harus `null` dan `error.code` + `error.message` terisi.
- `message` ditulis dalam Bahasa Indonesia dan cukup jelas untuk pengguna biasa.

---

## 2. Daftar Kode Error

| Kode | HTTP | Kapan dipakai |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | Input tidak valid (zod gagal) |
| `UNAUTHORIZED` | 401 | Belum login atau sesi tidak valid |
| `FORBIDDEN` | 403 | Sudah login tapi role/owner tidak berhak |
| `NOT_FOUND` | 404 | Data tidak ditemukan |
| `EMAIL_ALREADY_REGISTERED` | 409 | Email sudah dipakai saat registrasi |
| `OUT_OF_STOCK` | 409 | Stok tiket tidak cukup |
| `ORDER_EXPIRED` | 409 | Order sudah lewat batas waktu bayar |
| `TICKET_NOT_FOUND` | 404 | QR yang dipindai tidak dikenal |
| `TICKET_ALREADY_USED` | 409 | QR sudah pernah di-check-in |
| `PAYMENT_FAILED` | 400 | Proses pembayaran gagal |
| `ORDER_NOT_PAYABLE` | 409 | Order tidak bisa diproses pembayaran (bukan `pending`) |
| `RATE_LIMITED` | 429 | Terlalu banyak request dalam waktu singkat |
| `METHOD_NOT_ALLOWED` | 405 | Method HTTP tidak didukung endpoint itu |
| `INTERNAL_ERROR` | 500 | Error tak terduga di server |

---

## 3. Aturan Pagination & Filter untuk `GET /api/events`

Semua daftar (list) memakai satu bentuk pagination yang sama:

**Query params (semua opsional kecuali disebut):**

| Nama | Tipe | Default | Keterangan |
| --- | --- | --- | --- |
| `page` | integer | 1 | Halaman yang diminta (mulai 1) |
| `pageSize` | integer | 12 | Maks **50** per halaman |
| `q` | string | — | Pencarian teks pada judul event |
| `categorySlug` | string | — | Filter kategori (mis. `konser`) |
| `dateFrom` | date (`YYYY-MM-DD`) | — | Cari event yang mulai pada/lewat tanggal ini |
| `dateTo` | date (`YYYY-MM-DD`) | — | Cari event yang mulai sebelum/sama tanggal ini |
| `location` | string | — | Filter lokasi (kata sebagian juga cocok) |
| `sort` | string | `latest` | `latest` (terbaru) atau `popular` (terbanyak terjual) |

**Struktur response `data` untuk list:**

```json
{
  "items": [],
  "page": 1,
  "pageSize": 12,
  "total": 1,
  "totalPages": 1
}
```

- `items` = data halaman ini.
- `total` = jumlah item seluruh filter (untuk hitung halaman di UI).
- Kalau `page > totalPages`, balas `items` kosong, bukan error.

**Aturan tambahan:**

- Endpoint publik **hanya mengembalikan event `published`** dan yang belum selesai.
- `sort=popular` dihitung dari total `ticket_types.stock_sold` event tersebut.
- `q` mencari sebagian kata pada `title` (di-contract seperti ini dulu, detail query
  diputuskan saat coding — jangan menebak).

---

## 4. Daftar Endpoint

### 4.1 Auth & Profile

#### `POST /api/auth/register`
- **Akses:** guest
- **Request body**
```json
{ "email": "user@email.com", "password": "rahasia123", "fullName": "Budi Susilo" }
```
- **Response 201**
```json
{ "success": true, "data": { "id": "uuid", "email": "user@email.com", "fullName": "Budi Susilo", "role": "user" }, "error": null }
```
- **Error:** `VALIDATION_ERROR`, `EMAIL_ALREADY_REGISTERED`, `RATE_LIMITED`. Kalau sudah login → `UNAUTHORIZED`.

#### `POST /api/auth/login`
- **Akses:** guest
- **Request body**
```json
{ "email": "user@email.com", "password": "rahasia123" }
```
- **Response 200** — set cookie sesi Supabase, lalu:
```json
{ "success": true, "data": { "id": "uuid", "email": "user@email.com", "fullName": "Budi Susilo", "role": "user" }, "error": null }
```
- **Error:** `VALIDATION_ERROR`, `UNAUTHORIZED` (email/password salah), `RATE_LIMITED`.

#### `POST /api/auth/logout`
- **Akses:** user, staff, admin, organizer
- **Request body:** tidak ada
- **Response 200:** `{ "success": true, "data": null, "error": null }`
- **Error:** `UNAUTHORIZED`.

#### `GET /api/profile`
- **Akses:** user, staff, admin, organizer
- **Response 200**
```json
{ "success": true, "data": { "id": "uuid", "email": "user@email.com", "fullName": "Budi Susilo", "avatarUrl": null, "role": "user" }, "error": null }
```
- **Error:** `UNAUTHORIZED`, `NOT_FOUND` (profil belum ada).

#### `PATCH /api/profile`
- **Akses:** user, staff, admin, organizer (hanya profil sendiri)
- **Request body** (semua opsional)
```json
{ "fullName": "Budi Setiawan", "avatarUrl": "https://..." }
```
- **Response 200:** data profil yang baru (sama bentuk dengan GET).
- **Error:** `UNAUTHORIZED`, `VALIDATION_ERROR`.

---

### 4.2 Event Publik

#### `GET /api/events`
- **Akses:** publik (guest + semua role)
- **Query:** lihat bagian 3 (pagination & filter).
- **Response 200** — data list events berisi: `id`, `title`, `slug`, `categorySlug`,
  `location`, `imageUrl`, `startsAt`, `endsAt`, `totalSold`.
- **Error:** `VALIDATION_ERROR` (param tidak valid, mis. `pageSize` > 50).

#### `GET /api/events/[eventId]`
- **Akses:** publik
- **Response 200:** detail event: `id`, `title`, `slug`, `categorySlug`, `description`,
  `location`, `imageUrl`, `startsAt`, `endsAt`, `status`, `ticketTypes`.
- **Error:** `VALIDATION_ERROR`, `NOT_FOUND`, (event `draft` → `NOT_FOUND` untuk publik).

#### `GET /api/categories`
- **Akses:** publik (untuk pilihan filter di frontend)
- **Response 200**
```json
{ "success": true, "data": { "items": [ { "slug": "konser", "name": "Konser" } ] }, "error": null }
```
- **Error:** `INTERNAL_ERROR`.

---

### 4.3 Ticket Types (jenis tiket)

#### `GET /api/events/[eventId]/ticket-types`
- **Akses:** publik
- **Response 200**
```json
{ "success": true, "data": { "items": [ { "id": "uuid", "name": "VIP", "price": 250000, "remainingStock": 40, "maxPerOrder": 5 } ] }, "error": null }
```
- `price` integer Rupiah; `remainingStock = stock_total - stock_sold`.
- **Error:** `VALIDATION_ERROR`, `NOT_FOUND`.

---

### 4.4 Orders

#### `POST /api/orders` (checkout / buat pesanan)
- **Akses:** user (dan admin)
  - `user_id` di **server** diambil dari sesi login, **bukan** dari body (user tidak boleh
    menebak order atas nama orang lain).
- **Request body**
```json
{ "items": [ { "ticketTypeId": "uuid", "quantity": 2 } ] }
```
- **Response 201** — `payment_due_at` = sekarang + 15 menit.
```json
{ "success": true, "data": { "id": "uuid", "orderNumber": "ORD-2026-0001", "status": "awaiting_payment", "totalAmount": 500000, "paymentDueAt": "2026-11-01T10:15:00+07:00", "items": [ { "ticketTypeId": "uuid", "name": "VIP", "quantity": 2, "unitPrice": 250000, "subtotal": 500000 } ] }, "error": null }
```
- **Error:** `VALIDATION_ERROR`, `UNAUTHORIZED`, `OUT_OF_STOCK`, `ORDER_EXPIRED` (jarang di create),
  `RATE_LIMITED`. `quantity` > `max_per_order` → `VALIDATION_ERROR`.

#### `GET /api/orders` (riwayat pesanan saya)
- **Akses:** user (hanya punya sendiri). Admin lihat lewat endpoint admin.
- **Query:** `page`, `pageSize` (lihat aturan pagination).
- **Response 200:** list order milik user: `id`, `orderNumber`, `status`, `totalAmount`,
  `createdAt`, `paymentStatus` (taken dari payment terkait).
- **Error:** `UNAUTHORIZED`.

#### `GET /api/orders/[orderId]`
- **Akses:** user pemilik (owner check → selain pemilik = `FORBIDDEN`), atau admin.
- **Response 200:** detail order + items + payment + daftar tickets (kalau sudah terbit).
- **Error:** `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`.

#### `GET /api/orders/[orderId]/invoice`
- **Akses:** user pemilik atau admin.
- **Response 200**
```json
{ "success": true, "data": { "invoiceNumber": "INV-2026-0001", "orderNumber": "ORD-2026-0001", "buyer": { "fullName": "Budi Susilo", "email": "user@email.com" }, "items": [], "totalAmount": 500000, "issuedAt": "2026-11-01T10:00:00+07:00" }, "error": null }
```
- **Error:** `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`. Kalau belum `paid` → `FORBIDDEN` atau
  invoice belum terbit (detail keputusannya dikonfirmasi saat coding).

#### `POST /api/orders/[orderId]/cancel`
- **Akses:** user pemilik (hanya order miliknya yang masih `awaiting_payment`), atau admin.
- **Request body:** opsional `{ "reason": "Perubahan rencana" }`.
- **Response 200:** order jadi `cancelled`, payment jadi `expired/dibatalkan`, stok kembali
  (sesuai `docs/order-flow.md`).
- **Error:** `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `ORDER_EXPIRED` (sudah lewat waktu,
  biarkan status expired), `CONFLICT` bila status tidak memungkinkan.

---

### 4.5 Pembayaran (Simulasi + Webhook)

#### `POST /api/payments/simulate/[orderId]`
- **Akses:** user pemilik (order masih `pending` & `awaiting_payment`). Body kosong.
- **Kegunaan:** menggantikan payment gateway sungguhan di MVP. Sistem men-simulasikan
  "gateway sukses", lalu menjalankan **logika konfirmasi yang sama seperti webhook**:
  payment `paid`, order `completed`, e-ticket terbit.
- **Response 200**
```json
{ "success": true, "data": { "paymentId": "uuid", "status": "paid", "paidAt": "2026-11-01T10:01:00+07:00", "ticketsIssued": 2 }, "error": null }
```
- **Error:** `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `ORDER_EXPIRED`, `ORDER_NOT_PAYABLE`.

#### `POST /api/webhooks/payment`
- **Akses:** dipanggil SERVER-TO-SERVER oleh payment gateway. Tidak butuh cookie login.
  Divalidasi dengan **secret** (`PAYMENT_WEBHOOK_SECRET`); kalau signature tidak cocok →
  `UNAUTHORIZED`.
- **Request body** (bentuk awal; menyesuaikan provider di fase lanjutan Midtrans/Xendit):
```json
{ "orderId": "uuid", "status": "paid", "providerTxId": "TX-12345", "amount": 500000 }
```
- **Response 200:** `{ "success": true, "data": null, "error": null }` — selalu 200 kalau
  signature valid, supaya provider tidak mengirim ulang.
- **Error:** `UNAUTHORIZED` (signature salah), `VALIDATION_ERROR`, `NOT_FOUND`, `ORDER_EXPIRED`
  (kalau lewat, sistem tolak keras agar tidak ada pembayaran telat).

> MVP: endpoint simulasi `POST /api/payments/simulate/[orderId]` dan webhook ini berbagi
> fungsi internal yang sama (`konfirmasiPembayaran`), sehingga nanti tinggal mengganti sumber
> notifikasinya dari simulasi ke Midtrans/Xendit.

---

### 4.6 Tiket & Check-in

#### `GET /api/tickets` (e-tickets saya)
- **Akses:** user (hanya milik pesanan sendiri). Query: `page`, `pageSize`, `eventId` (opsional).
- **Response 200:** list tiket: `id`, `code`, `status`, `eventTitle`, `ticketTypeName`,
  `eventStartsAt`, `qrToken`.
- **Error:** `UNAUTHORIZED`.

#### `GET /api/tickets/[ticketId]`
- **Akses:** user pemilik, atau admin.
- **Response 200:** detail 1 tiket (termasuk `qrToken` untuk ditampilkan sebagai QR).
- **Error:** `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`.

#### `POST /api/check-in`
- **Akses:** staff, admin (organizer di fase lanjutan).
- **Request body** — hasil pemindaian kamera:
```json
{ "qrToken": "tJ0kE..." }
```
- **Response 200** (tiket valid, status jadi `used`):
```json
{ "success": true, "data": { "result": "valid", "ticketId": "uuid", "code": "TKT-VIP-000123", "ownerName": "Budi Susilo", "eventTitle": "Konser Nidji 2026", "checkedIn": true }, "error": null }
```
- **Error / cek tambahan:** QR tidak dikenal → `TICKET_NOT_FOUND`; sudah `used` →
  `TICKET_ALREADY_USED`; sudah `cancelled` → `TICKET_NOT_FOUND` (diperlakukan seperti tidak ada);
  `UNAUTHORIZED`, `FORBIDDEN`.

> Anti reuse QR: ketika `status = used`, endpoint wajib menolak. Detail alur di
> `docs/order-flow.md`.

---

### 4.7 Admin

Semua endpoint admin: **admin saja**, kecuali dicatat lain. Body/query ikut aturan umum
(`VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN` selalu bisa muncul).

#### Statistik & laporan
| Method & Path | Request | Response `data` |
| --- | --- | --- |
| `GET /api/admin/stats` | — | `{ totalEvents, totalUsers, totalRevenue, totalTicketsSold }` |
| `GET /api/admin/reports/sales` | Query: `groupBy=event` / `groupBy=day`, `dateFrom`, `dateTo` | items berisi `{ label, revenue, ticketsSold, refundedAmount }` |

#### Event (CRUD)
| Method & Path | Request | Keterangan |
| --- | --- | --- |
| `GET /api/admin/events` | Query: `page`, `pageSize`, `status`, `q` | List semua event (termasuk `draft`) |
| `POST /api/admin/events` | Body: `{ title, slug, categorySlug, description, location, imageUrl, startsAt, endsAt }` | Buat event (`status` default `draft`) |
| `PATCH /api/admin/events/[eventId]` | Body: field yang diubah + `status` (mis. jadi `published`) | Update event |
| `DELETE /api/admin/events/[eventId]` | — | Hapus/arsipkan (soft: `status = cancelled`) |

#### Kategori event & jenis tiket
| Method & Path | Request |
| --- | --- |
| `POST /api/admin/categories` | `{ name, slug }` |
| `PATCH /api/admin/categories/[categoryId]` | `{ name?, slug? }` |
| `DELETE /api/admin/categories/[categoryId]` | — |
| `GET /api/admin/events/[eventId]/ticket-types` | — |
| `POST /api/admin/events/[eventId]/ticket-types` | `{ name, price, stockTotal, maxPerOrder }` |
| `PATCH /api/admin/ticket-types/[ticketTypeId]` | `{ name?, price?, stockTotal?, maxPerOrder?, isActive? }` |
| `DELETE /api/admin/ticket-types/[ticketTypeId]` | — (ditandai `is_active = false`, tidak dihapus fisik bila sudah ada order) |

#### User & role
| Method & Path | Request | Keterangan |
| --- | --- | --- |
| `GET /api/admin/users` | Query: `page`, `pageSize`, `role`, `q` | List user |
| `PATCH /api/admin/users/[userId]/role` | `{ role: "staff" / "admin" / "user" }` | Ubah role. Admin tidak bisa downgrade admin terakhir (keputusan aman — admin terakhir dilindungi) |

> Mengubah role seseorang juga mencerminkan ke `profiles` di Supabase; ini dilakukan
> **di server** dengan service role, bukan di browser.

#### Orders (admin)
| Method & Path | Request | Keterangan |
| --- | --- | --- |
| `GET /api/admin/orders` | Query: `page`, `pageSize`, `status`, `eventId`, `q` | List semua order |
| `GET /api/admin/orders/[orderId]` | — | Detail order + items + payment (sama bentuk user ordenya) |
| `PATCH /api/admin/orders/[orderId]/status` | `{ status: "cancelled" }` | Ubah status order bila perlu (mengikuti transisi yang boleh di `docs/order-flow.md`) |

#### Payments (admin)
| Method & Path | Request | Keterangan |
| --- | --- | --- |
| `GET /api/admin/payments` | Query: `page`, `pageSize`, `status` | List pembayaran |
| `POST /api/admin/payments/[paymentId]/confirm` | — | Konfirmasi manual (opsional, bila simulasi/otomatis tidak jalan) |
| `POST /api/admin/payments/[paymentId]/refund` | Body: `{ reason }` | Proses refund: payment `refunded`, tiket `cancelled`, stok kembali |

#### Audit log
| Method & Path | Request | Keterangan |
| --- | --- | --- |
| `GET /api/admin/audit-logs` | Query: `page`, `pageSize`, `action`, `entityType`, `dateFrom`, `dateTo` | List riwayat aksi (append-only) |

---

## 5. Endpoint Sistem

| Method & Path | Akses | Keterangan |
| --- | --- | --- |
| `GET /api/cron/expire-orders` | Dipanggil Vercel Cron (dilindungi `CRON_SECRET`) | Menandai order `pending` yang lewat `payment_due_at` jadi `expired` + mengembalikan stok. Juga dipakai "cek saat diakses" pada logika order. Detail di `docs/architecture.md`. |

---

## 6. Aturan Umum yang Mengikat

1. **Semua body request divalidasi zod di Route Handler** sebelum masuk ke service.
2. **Owner check wajib** untuk endpoint yang berisi `[orderId]`, `[ticketId]`: selain pemilik
   dan bukan admin → `FORBIDDEN` (403). (Lihat `docs/permission.md` bagian 4.)
3. **`user_id` tidak pernah diambil dari body** klien untuk operasi yang sensitif; selalu dari
   sesi login di server.
4. Semua perubahan status penting **dicatat ke `audit_logs`**.
5. Series endpoint yang harus memperbarui beberapa tabel sekaligus (buat order, konfirmasi
   bayar, refund) memakai **RPC/service role** supaya atomik — tidak dilakukan query per-tabel
   di Route Handler.
6. Endpoint publik hanya menampilkan event `published`.

---

## 7. Dokumen Terkait

- `docs/permission.md` — matriks akses per role (sumber siapa-boleh-apa).
- `docs/data-model.md` — bentuk tabel yang soal field di atas bersandar.
- `docs/order-flow.md` — transisi status yang boleh (order/payment/ticket).