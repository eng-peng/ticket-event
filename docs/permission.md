# Permission (Hak Akses / RBAC)

> Dokumen ini menjelaskan **siapa boleh melakukan apa**. RBAC = *Role-Based Access Control*,
> artinya hak akses ditentukan dari peran (role) seseorang, bukan dari siapa orangnya.
>
> Aturan ini adalah **sumber kebenaran** saat menulis pengecekan di kode.
> Pasangan wajib dari dokumen ini: `docs/order-flow.md` dan `docs/PRD.md`.

---

## 1. Daftar Role

| Role | Siapa | Dibuat kapan |
| --- | --- | --- |
| **guest** | Pengunjung yang belum login | Selalu ada (bukan data di database) |
| **user** | Pengunjung yang sudah daftar & login | MVP |
| **staff** | Petugas lapangan untuk validasi / check-in tiket | MVP |
| **admin** | Pengelola website (karyawan internal) | MVP |
| **organizer** | Penyelenggara event | **Fase lanjutan** |

> Catatan: satu orang punya **satu role aktif** di MVP. Kalau nanti butuh banyak role
> sekaligus, itu keputusan yang harus didiskusikan dulu (jangan menebak).

---

## 2. Prinsip Dasar

1. **Paling sedikit hak akses (least privilege).** Beri hak akses seminimal mungkin.
   Contoh: user biasa tidak butuh akses hapus event, jadi jangan diberi.
2. **Tamu (guest) hanya boleh membaca halaman publik.** Semua aksi yang mengubah data
   butuh login.
3. **User hanya boleh menyentuh data miliknya sendiri.** Lihat bagian 4.
4. **Pengecekan role terjadi di SERVER (Route Handlers),** bukan hanya sembunyikan tombol
   di frontend. Menyembunyikan tombol itu kenyamanan, bukan keamanan.

---

## 3. Matriks Hak Akses

Keterangan: ✅ = boleh, ❌ = tidak boleh, 👤 = hanya data milik sendiri, ➖ = tidak relevan.

### 3.1 Publik & Event

| Aksi | guest | user | staff | admin | organizer |
| --- | :---: | :---: | :---: | :---: | :---: |
| Lihat daftar event | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cari & filter event | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lihat detail event | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lihat event terbaru & populer (beranda) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Daftar (registrasi) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Login | ✅ | ❌ | ❌ | ❌ | ❌ |
| Buat event | ❌ | ❌ | ❌ | ✅ | ✅ *(lanjutan)* |
| Ubah event | ❌ | ❌ | ❌ | ✅ | ✅ *(lanjutan)* |
| Hapus event | ❌ | ❌ | ❌ | ✅ | ✅ *(lanjutan)* |

### 3.2 Tiket, Checkout, dan E-ticket

| Aksi | guest | user | staff | admin | organizer |
| --- | :---: | :---: | :---: | :---: | :---: |
| Lihat jenis tiket & harga di detail event | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pilih tiket & buat order (checkout) | ❌ | 👤 | ❌ | ✅ | ✅ *(lanjutan)* |
| Bayar (proses pembayaran simulasi) | ❌ | 👤 | ❌ | ✅ | ✅ *(lanjutan)* |
| Lihat riwayat pesanan | ❌ | 👤 | ❌ | ✅ *(semua)* | ✅ *(event sendiri, lanjutan)* |
| Lihat detail order & invoice | ❌ | 👤 | ❌ | ✅ *(semua)* | ✅ *(event sendiri, lanjutan)* |
| Lihat / unduh e-ticket (QR) | ❌ | 👤 | ❌ | ✅ | ✅ *(lanjutan)* |
| Validasi / check-in QR tiket | ❌ | ❌ | ✅ | ✅ | ✅ *(lanjutan)* |

### 3.3 Profil

| Aksi | guest | user | staff | admin | organizer |
| --- | :---: | :---: | :---: | :---: | :---: |
| Lihat profil sendiri | ❌ | 👤 | 👤 | 👤 | 👤 |
| Ubah profil sendiri | ❌ | 👤 | 👤 | 👤 | 👤 |
| Lihat profil orang lain | ❌ | ❌ | ❌ | ✅ | ❌ |
| Ubah role orang lain | ❌ | ❌ | ❌ | ✅ | ❌ |
| Nonaktifkan / hapus user | ❌ | ❌ | ❌ | ✅ | ❌ |

### 3.4 Kategori Tiket

| Aksi | guest | user | staff | admin | organizer |
| --- | :---: | :---: | :---: | :---: | :---: |
| Lihat kategori tiket sebuah event | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tambah / ubah / hapus kategori tiket | ❌ | ❌ | ❌ | ✅ | ✅ *(lanjutan)* |

### 3.5 Pembayaran & Refund

| Aksi | guest | user | staff | admin | organizer |
| --- | :---: | :---: | :---: | :---: | :---: |
| Menerima notifikasi webhook pembayaran | ➖ | ➖ | ➖ | ✅ *(sistem)* | ➖ |
| Konfirmasi pembayaran (manual) | ❌ | ❌ | ❌ | ✅ | ✅ *(lanjutan)* |
| Proses refund | ❌ | ❌ | ❌ | ✅ | ✅ *(lanjutan)* |
| Lihat status pembayaran sendiri | ❌ | 👤 | ❌ | ✅ | ✅ *(lanjutan)* |
| Tandai order expired manual | ❌ | ❌ | ❌ | ✅ | ✅ *(lanjutan)* |

### 3.6 Laporan & Statistik

| Aksi | guest | user | staff | admin | organizer |
| --- | :---: | :---: | :---: | :---: | :---: |
| Lihat statistik website | ❌ | ❌ | ❌ | ✅ | ❌ |
| Lihat laporan penjualan | ❌ | ❌ | ❌ | ✅ *(semua)* | ✅ *(event sendiri, lanjutan)* |
| Lihat audit log | ❌ | ❌ | ❌ | ✅ | ❌ |

### 3.7 Staff (khusus)

| Aksi | guest | user | staff | admin | organizer |
| --- | :---: | :---: | :---: | :---: | :---: |
| Scan / validasi QR tiket | ❌ | ❌ | ✅ | ✅ | ✅ *(lanjutan)* |
| Lihat hasil scan (valid / sudah dipakai / tidak ditemukan) | ❌ | ❌ | ✅ | ✅ | ✅ *(lanjutan)* |
| Lihat daftar peserta event (untuk pengecekan manual) | ❌ | ❌ | ✅ *(event yang ditugaskan)* | ✅ | ✅ *(lanjutan)* |
| Lihat data pribadi user selain untuk check-in | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 4. Aturan "User Hanya Boleh Melihat Order Milik Sendiri"

Aturan ini wajib ada dan wajib dites. Ini inti dari perlindungan data pribadi.

### 4.1 Aturannya

1. Setiap order (pesanan) punya **pemilik**, yaitu `user_id` siapa yang membuat order itu.
2. Saat user meminta riwayat pesanan, sistem **harus selalu menyaring berdasarkan
   `user_id = user yang sedang login`.** Tidak ada jalan untuk meminta milik orang lain.
3. Saat user membuka detail 1 order (termasuk invoice & e-ticket), sistem **wajib mengecek**
   dulu: `order.user_id` harus sama dengan user yang sedang login.
4. **Kalau beda → tolak.** Gunakan status **403 Forbidden** (bukan 404), supaya jelas bahwa
   itu masalah hak akses. (Pilihan 404 vs 403 bisa didiskusikan, jangan menebak.)
5. **E-ticket adalah data sensitif.** QR-nya tidak boleh bisa diakses oleh user lain,
   karena orang lain bisa saja menyalin QR-nya untuk check-in.
6. **Aturan ini berlaku juga untuk staff dan organizer:** staff hanya melihat data yang
   cukup untuk check-in, organizer hanya melihat order untuk event miliknya sendiri
   (organizer = fase lanjutan).

### 4.2 Pengecekan dilakukan di mana

- **Di server**, pada Route Handlers, sebelum data dikirim ke browser.
- **Di database**, dengan cara menyertakan filter `user_id` pada query (lebih aman daripada
  mengambil semua data lalu membuang di kode).
- Menyembunyikan tombol/teks di frontend **tidak cukup** — itu hanya tampilan.

### 4.3 Contoh kasus

| Situasi | Hasil yang benar |
| --- | --- |
| User A buka riwayat pesanan | Hanya order milik A yang tampil |
| User A buka `order milik B` (dengan menebak ID) | **Ditolak (403)** |
| User A buka e-ticket milik B | **Ditolak (403)** |
| Admin buka order milik A | **Boleh** (admin memang mengelola semua) |
| Staff scan QR milik A | **Boleh** (untuk check-in), tapi tidak boleh melihat data lain milik A |
| Guest buka halaman riwayat pesanan | **Ditolak**, disuruh login |

---

## 5. Cara Cek di Kode (panduan, bukan kode final)

Urutan pengecekan yang disarankan untuk setiap endpoint:

1. **Sudah login?** Kalau belum → tolak (401).
2. **Role-nya berhak?** Kalau tidak → tolak (403).
3. **Datanya miliknya?** (kalau aturan kepemilikan berlaku) Kalau bukan → tolak (403).
4. **Input-nya valid?** (pakai zod) Kalau tidak → tolak (400).
5. Baru **proses** dan kembalikan hasil.

---

## 6. Dokumen Terkait

- `docs/PRD.md` — daftar fitur dan prioritas (MVP / Lanjutan).
- `docs/order-flow.md` — alur pesanan & status, termasuk siapa boleh mengubah status apa.
- `docs/logging.md` — mencatat akses penting ke audit log (dibuat saat mulai coding).
