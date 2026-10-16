# PRD (Product Requirement Document)

> Dokumen ini menjelaskan **apa yang mau dibangun**, untuk siapa, dan apa yang termasuk /
> tidak termasuk dalam fase pertama (MVP). Ditulis dengan bahasa sederhana untuk pemula.

---

## 1. Latar Belakang

Penyelenggara event (konser, seminar, workshop) sering kesulitan menjual dan mengelola
tiket secara manual: pakai spreadsheet, transfer manual, dan tiket fisik yang mudah
hilang atau dipalsukan. Pembeli juga bingung karena tidak ada tempat terpadu untuk
melihat event dan memastikan tiketnya asli.

Website ini hadir sebagai tempat penjualan tiket online: pembeli bisa menemukan event,
membayar, dan langsung mendapat **e-ticket dengan QR Code**. Penyelenggara dan admin
bisa mengelola event, stok, dan penjualan dari satu panel.

---

## 2. Tujuan

1. Menyediakan tempat bagi pengguna untuk menemukan event dan membeli tiket secara online.
2. Mengeluarkan tiket digital (e-ticket + QR Code) yang aman dan tidak bisa dipakai dua kali.
3. Memberi admin (dan di fase lanjutan, organizer) alat untuk mengelola event, stok, pesanan, dan laporan penjualan.

---

## 3. Target Pengguna

| Peran | Siapa | Kebutuhan utama |
| --- | --- | --- |
| **Guest** | Pengunjung belum punya akun | Cari dan lihat event |
| **User** | Pengunjung yang sudah daftar akun | Beli tiket, lihat pesanan & e-ticket |
| **Staff** | Petugas di lapangan | Validasi / check-in QR tiket |
| **Admin** | Pengelola website | Kelola event, user, order, pembayaran, laporan, audit log |
| **Organizer** | Penyelenggara event | Kelola event & penjualan sendiri (**fase lanjutan**) |

---

## 4. Daftar Fitur dan Prioritas

Keterangan prioritas:

- **MVP** = dibuat di fase pertama, wajib ada.
- **Lanjutan** = dibuat setelah MVP, bukan bagian dari fase pertama.

### A. User (Pembeli)

| # | Fitur | Prioritas | User story singkat |
| --- | --- | --- | --- |
| A1 | Beranda: event terbaru & populer | MVP | "Sebagai pengunjung, saya ingin melihat event terbaru dan yang paling banyak dibeli supaya saya cepat tahu event yang sedang naik daun." |
| A2 | Daftar semua event | MVP | "Sebagai pengunjung, saya ingin melihat seluruh event yang tersedia supaya saya bisa memilih." |
| A3 | Pencarian & filter (nama, kategori, tanggal, lokasi) | MVP | "Sebagai pengunjung, saya ingin mencari event berdasarkan nama, kategori, tanggal, dan lokasi supaya tidak perlu scroll satu-satu." |
| A4 | Detail event (termasuk pilihan tiket) | MVP | "Sebagai pengunjung, saya ingin melihat detail event dan jenis tiket yang dijual sebelum membeli." |
| A5 | Registrasi & login | MVP | "Sebagai pengunjung, saya ingin membuat akun dan masuk supaya bisa membeli tiket." |
| A6 | Pilih tiket (jenis & jumlah) | MVP | "Sebagai user, saya ingin memilih jenis tiket dan berapa banyak yang saya beli." |
| A7 | Checkout | MVP | "Sebagai user, saya ingin membayar pesanan saya dengan jelas dan mendapat status yang pasti." |
| A8 | Riwayat pesanan | MVP | "Sebagai user, saya ingin melihat semua pesanan yang pernah saya buat." |
| A9 | E-ticket (QR Code) | MVP | "Sebagai user, saya ingin menerima tiket digital dengan QR Code setelah pesanan berhasil dibayar." |
| A10 | Profil (lihat & ubah data diri) | MVP | "Sebagai user, saya ingin melihat dan mengubah data profil saya." |

### B. Organizer (Penyelenggara)

> **Semua fitur ini FASE LANJUTAN, bukan MVP.**

| # | Fitur | Prioritas | User story singkat |
| --- | --- | --- | --- |
| B1 | Buat event | Lanjutan | "Sebagai organizer, saya ingin membuat event baru beserta detailnya." |
| B2 | Kelola kategori tiket | Lanjutan | "Sebagai organizer, saya ingin menambah / mengubah jenis tiket (mis. VIP, Reguler)." |
| B3 | Kelola stok & harga | Lanjutan | "Sebagai organizer, saya ingin mengatur sisa stok dan harga tiap jenis tiket." |
| B4 | Kelola pesanan | Lanjutan | "Sebagai organizer, saya ingin melihat pesanan untuk event saya." |
| B5 | Laporan penjualan | Lanjutan | "Sebagai organizer, saya ingin melihat berapa tiket terjual dan berapa uang yang masuk." |
| B6 | Check-in pengunjung | Lanjutan | "Sebagai organizer/staff, saya ingin memindai QR tiket saat pengunjung datang." |

### C. Pembayaran

| # | Fitur | Prioritas | Keterangan |
| --- | --- | --- | --- |
| C1 | Status pembayaran: `pending`, `paid`, `failed`, `expired`, `refunded` | MVP | Semua status harus ada dan bisa dilacak. |
| C2 | Batas waktu bayar (expired otomatis) | MVP | Kalau tidak bayar sampai batas waktu, order otomatis expired dan stok dikembalikan. |
| C3 | Konfirmasi via webhook | MVP | Sistem menerima notifikasi pembayaran dari penyedia pembayaran (untuk MVP: simulasi). |
| C4 | Invoice | MVP | Setiap pesanan punya ringkasan/invoice yang bisa dilihat user. |
| C5 | Refund | MVP (alur & status) | Status `refunded` dan alurnya tersedia; pelaksanaan bisa manual/simulasi. |
| C6 | Integrasi payment gateway (Midtrans / Xendit) | Lanjutan | Ganti pembayaran simulasi dengan pembayaran sungguhan. |

### D. Tiket Digital

| # | Fitur | Prioritas | Keterangan |
| --- | --- | --- | --- |
| D1 | 1 tiket = 1 QR Code unik | MVP | Beli 3 tiket = 3 QR berbeda (bukan 1 QR dipakai 3 orang). |
| D2 | Nomor tiket | MVP | Tiap tiket punya nomor unik yang mudah dibaca. |
| D3 | Status tiket: `valid`, `used`, `cancelled` | MVP | Status menentukan apakah tiket masih bisa dipakai. |
| D4 | Validasi & check-in oleh staff | MVP | Staff memindai QR; kalau valid jadi `used`, kalau sudah `used` harus ditolak. |

### E. Admin

| # | Fitur | Prioritas | Keterangan |
| --- | --- | --- | --- |
| E1 | Statistik (ringkasan penjualan, jumlah event, jumlah user) | MVP | Halaman ringkasan untuk admin. |
| E2 | CRUD event | MVP | Tambah, ubah, lihat, hapus event. |
| E3 | CRUD kategori tiket | MVP | Kelola jenis tiket per event. |
| E4 | Manajemen user & role | MVP | Ubah peran user (mis. jadikan staff). |
| E5 | Manajemen order | MVP | Lihat dan ubah status order bila perlu. |
| E6 | Manajemen pembayaran & refund | MVP | Konfirmasi pembayaran dan proses refund. |
| E7 | Laporan | MVP | Laporan penjualan sederhana. |
| E8 | Audit log | MVP | Catatan "siapa melakukan apa, kapan". |

### F. Keamanan (lintas fitur)

| # | Fitur | Prioritas | Keterangan |
| --- | --- | --- | --- |
| F1 | RBAC (role-based access control) | MVP | Hanya role yang berhak yang bisa mengakses. Lihat `docs/permission.md`. |
| F2 | Validasi input di backend (zod) | MVP | Semua input dari user dicek dulu di server. |
| F3 | Hash password | MVP | Password tidak pernah disimpan dalam bentuk asli. |
| F4 | Validasi webhook | MVP | Notifikasi pembayaran harus benar-benar dari penyedia (dicek signature/secretnya). |
| F5 | Anti oversell stok | MVP | Stok tidak boleh jadi minus / terjual lebih dari kapasitas. |
| F6 | QR tidak bisa dipakai ulang | MVP | QR yang sudah di-check-in tidak bisa discan lagi. |
| F7 | Rate limiting | MVP | Batasi jumlah request supaya tidak ada serangan brute-force. |
| F8 | Audit log | MVP | Setiap akses penting dicatat. |

---

## 5. Batasan (Out of Scope / Tidak Dikerjakan di MVP)

Hal-hal berikut **tidak** dikerjakan di fase MVP:

1. **Semua fitur Organizer (bagian B)** — ini FASE LANJUTAN.
2. **Integrasi payment gateway sungguhan (Midtrans/Xendit)** — MVP pakai pembayaran simulasi dulu.
3. **Multi-bahasa / multi-mata uang** — hanya bahasa Indonesia dan rupiah.
4. **Aplikasi mobile native** — hanya website responsif.
5. **Sistem poin / loyalitas / diskon kompleks** — tidak di MVP.
6. **Notifikasi email/SMS kompleks** — kalau dibutuhkan, minimal dulu (mis. hanya email konfirmasi).
7. **Upload media kompleks (video, gallery besar)** — cukup gambar poster event sederhana.

---

## 6. Kriteria Sukses MVP

MVP dianggap **berhasil** kalau semua ini terpenuhi:

1. **Pengunjung** bisa mencari & filter event, membuka detail event, daftar, dan login.
2. **User** bisa memilih tiket, checkout, dan mendapat status pembayaran yang jelas
   (`pending` / `paid` / `failed` / `expired`).
3. **Stok tidak pernah lebih** dari kapasitas yang ditentukan (tidak ada oversell), termasuk
   saat banyak orang membeli bersamaan.
4. **Order yang tidak dibayar sampai batas waktu** otomatis `expired` dan stoknya kembali.
5. **User yang sudah bayar** mendapat e-ticket; jumlah QR Code = jumlah tiket yang dibeli.
6. **Staff bisa memindai QR**; QR yang sudah dipakai **tidak bisa dipakai lagi**.
7. **User hanya bisa melihat pesanan miliknya sendiri** (tidak bisa membuka milik orang lain).
8. **Admin** bisa melihat statistik, mengelola event/kategori/user/order/pembayaran, dan melihat audit log.
9. **Lolos lint & typecheck**, berjalan tanpa error, dan semua komentar mengikuti aturan di `AGENT.md`.
10. Dokumen di `docs/` ikut diperbarui setiap kali ada perubahan aturan.

---

## 7. Dokumen Terkait

- `docs/permission.md` — siapa boleh melakukan apa (matriks role).
- `docs/order-flow.md` — alur pesanan dari pilih tiket sampai e-ticket terbit.
- Dokumen lanjutan (dibuat saat mulai coding): `docs/architecture.md`, `docs/data-model.md`,
  `docs/api-contract.md`, `docs/logging.md`, `docs/clean-dead-code.md`.
