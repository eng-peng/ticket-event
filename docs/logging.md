# Logging & Audit Log

> Dokumen ini menjelaskan perbedaan antara application log dan audit log, level log, format,
> apa yang boleh/tidak boleh dicatat, kejadian wajib audit, serta contoh helper sederhana.
> Ditulis sesuai kebutuhan MVP.

---

## 1. Perbedaan Application Log vs Audit Log

| Aspek | Application Log (untuk developer/debugging) | Audit Log (aktivitas penting) |
|---|---|---|
| Tujuan | Membantu menemukan bug, mendiagnosa masalah | Bukti aktivitas penting untuk keamanan & investigasi |
| Siapa yang baca | Developer saat debugging di Vercel/log lokal | Admin (dan pihak terkait) untuk audit |
| Penyimpanan | Output console (Vercel log). Bisa tersimpan sementara | Tabel `audit_logs` di Supabase Postgres (append-only) |
| Fokus | Alur teknis (request, error, timing) | Aksi yang berpengaruh (ubah role, refund, check-in) |
| Volume | Bisa lebih banyak | Terbatas pada kejadian penting |

Catatan: **audit log disimpan di database (`audit_logs`)**, bukan cuma console.
Application log cukup console dengan format JSON agar mudah dibaca di Vercel.

---

## 2. Level Log

Gunakan level berikut secara konsisten:

| Level | Kapan dipakai | Contoh |
|---|---|---|
| `info` | Kejadian normal yang berguna untuk trace | Request masuk, berhasil terbit tiket, cron selesai |
| `warn` | Situasi mencurigakan tapi belum error fatal | Login gagal beruntun, webhook invalid signature |
| `error` | Terjadi error (exception) | Gagal query, RPC gagal, konfirmasi bayar gagal |

> Jangan pakai level berlebihan. Cukup info/warn/error untuk MVP.

---

## 3. Format Log (JSON satu baris)

Semua **application log** ditulis dalam bentuk JSON satu baris, supaya gampang difilter di Vercel.

Field wajib:

- `timestamp` (ISO8601, UTC) — waktu kejadian
- `level` (`info|warn|error`)
- `message` (deskripsi singkat, Bahasa Indonesia)
- `requestId` (opsional, bisa generated per request)
- `userId` (opsional, isi kalau ada user login)
- `context` (opsional, object berisi info tambahan)

Contoh:

```json
{"timestamp":"2026-11-01T10:00:00Z","level":"info","message":"order.created","requestId":"req_123","userId":"uuid","context":{"orderId":"uuid","total":500000}}
```

> Untuk **audit log** yang masuk ke tabel `audit_logs`, fieldnya beda (lihat bagian 4).
> Application log TIDAK boleh menyalin seluruh isi tabel audit ke console.

---

## 4. Apa yang BOLEH dan TIDAK BOLEH Dicatat

### BOLEH dicatat (aman)
- ID non-sensitive: `userId`, `orderId`, `ticketId`, `eventId`, `paymentId`
- Status: `orderStatus`, `paymentStatus`, `ticketStatus`, `role`
- Jumlah angka: `quantity`, `totalAmount`
- Request method/path (tanpa query penuh yang berisi data sensitif)
- Waktu, requestId, action name

### TIDAK BOLEH dicatat (SANGAT penting)
- **Password** (dalam bentuk apa pun)
- **Token sesi / access token / refresh token**
- **QR token penuh** (`qr_token`) — cukup catat `ticketId` atau `code` (bukan token)
- **Data kartu kredit/debit**, CVV
- **Header `Authorization`** (hanya bisa dicatat keberadaan, bukan nilainya)
- **API key / service role key**
- **Alamat email lengkap** (lebih aman: hanya `userId`)
- **Nomor telepon / NIK / data pribadi sensitif lain**

> Prinsip: **kalau ragu, jangan dicatat**. Audit log cukup mencatat "siapa, aksi apa, kapan, ke data apa".
> Detail sensitif tidak perlu masuk log.

---

## 5. Kejadian yang Wajib Masuk Audit Log

Semua aksi berikut WAJIB ditulis ke `audit_logs` (tabel). Lihat struktur tabel di `docs/data-model.md`.

| Kejadian | `action` (saran) | `entity_type` | Keterangan |
|---|---|---|---|
| Login gagal beruntun | `auth.login_failed` | `profiles` | Catat userId/email yang dicoba (hati-hati dengan email) |
| Ubah role user | `user.role_changed` | `profiles` | Catat actor, target userId, oldRole -> newRole |
| Buat event | `event.created` | `events` | Catat actor & eventId |
| Ubah event | `event.updated` | `events` | Catat perubahan penting (status) |
| Hapus/arsip event | `event.archived` | `events` | Bisa soft delete via status |
| Buat ticket type | `ticket_type.created` | `ticket_types` | Catat eventId & ticketTypeId |
| Ubah ticket type | `ticket_type.updated` | `ticket_types` | Termasuk ubah harga/stok |
| Hapus ticket type | `ticket_type.deactivated` | `ticket_types` | Lebih aman soft delete (`is_active=false`) |
| Ubah status order | `order.status_changed` | `orders` | old -> new |
| Buat order | `order.created` | `orders` | Sudah wajib |
| Konfirmasi pembayaran / paid | `payment.confirmed` | `payments` | Webhook/simulasi sukses |
| Ubah status payment | `payment.status_changed` | `payments` | Termasuk failed/expired |
| Refund | `payment.refunded` | `payments` | Catat orderId, paymentId, amount, reason |
| Check-in (valid) | `ticket.checked_in` | `tickets` | Catat ticketId, checked_in_by, eventId |
| Hapus data penting | `data.deleted` | (sesuai entitas) | Sangat jarang di MVP (hindari hard delete) |

> **Append-only**: baris audit_logs TIDAK BOLEH diupdate/dihapus.

---

## 6. Contoh Helper (pseudo-code dengan komentar)

File helper disarankan: `lib/logger.ts` (application log) dan pemakaian langsung service
untuk audit log (bisa helper `lib/audit.ts` juga). Yang penting: **sederhana**.

### 6.1 Application Logger (`lib/logger.ts`)

```ts
// File ini berfungsi untuk mencatat application log (developer/debugging) dalam format JSON.

type LogLevel = 'info' | 'warn' | 'error';
type LogCtx = Record<string, unknown>;

function log(level: LogLevel, message: string, ctx?: LogCtx) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...ctx, // hati-hati: pastikan ctx aman (tidak ada secret)
  };
  if (level === 'error') console.error(JSON.stringify(entry));
  else if (level === 'warn') console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

export const logger = {
  info: (msg: string, ctx?: LogCtx) => log('info', msg, ctx),
  warn: (msg: string, ctx?: LogCtx) => log('warn', msg, ctx),
  error: (msg: string, ctx?: LogCtx) => log('error', msg, ctx),
};
```

**Aturan pakai:**
- Jangan log seluruh request body mentah (bisa ada password).
- Filter context: hanya field aman.
- Error log bisa menyertakan `error.message` (bukan stack trace penuh kalau tidak perlu).

### 6.2 Audit Helper (`lib/audit.ts`) — pseudo-code

```ts
// File ini berfungsi untuk menulis audit log ke tabel audit_logs (append-only).

import { createAdminClient } from '@/lib/supabase/admin';

export async function writeAudit(opts: {
  actorId?: string | null;      // profiles.id atau null (sistem/cron)
  action: string;               // mis. 'payment.refunded'
  entityType: string;           // 'payments'
  entityId: string;             // uuid
  details?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('audit_logs').insert({
    actor_id: opts.actorId ?? null,
    action: opts.action,
    entity_type: opts.entityType,
    entity_id: opts.entityId,
    details: opts.details ?? null,
    created_at: new Date().toISOString(),
  });
  if (error) {
    console.error(JSON.stringify({ level: 'error', message: 'audit.write_failed', context: { action: opts.action, entityType: opts.entityType } }));
  }
}
```

**Catatan:**
- Pakai `admin.ts` (service role) untuk insert audit.
- **Audit gagal jangan menggagalkan aksi utama**.
- `details` hanya berisi field aman.

### 6.3 Contoh pemakaian di Service

```ts
await writeAudit({
  actorId: adminId,
  action: 'payment.refunded',
  entityType: 'payments',
  entityId: paymentId,
  details: { orderId, amount, reason },
});
logger.info('payment.refunded', { paymentId, orderId, amount });
```

---

## 7. Praktik di Vercel

- Vercel menangkap `console.log/warn/error`. Format JSON memudahkan filter.
- RequestId bisa dibuat dari header `x-request-id` atau `crypto.randomUUID()`.
- Untuk cron (`/api/cron/expire-orders`), `actorId = null` (sistem).
- Jangan spam log: cukup log titik penting (start/end penting, error).

---

## 8. Dokumen Terkait

- `docs/data-model.md` — struktur tabel `audit_logs`
- `docs/architecture.md` — pola 3 lapis & service role
- `docs/permission.md` — kejadian sensitif terkait role
- `docs/api-contract.md` — endpoint terkait
- `docs/order-flow.md` — transisi status yang wajib diaudit
- `docs/clean-dead-code.md` — bersih-bersih console.log debug
