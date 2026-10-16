# Clean Dead Code

> Dokumen ini berisi checklist, perintah, aturan aman, dan template untuk membersihkan
> kode mati (dead code). Ditujukan untuk pemula.

---

## 1. Checklist Pembersihan Dead Code

Lakukan cek ini secara berurutan saat clean-up:

| No | Item | Keterangan |
|---|---|---|
| 1 | **Import tidak terpakai** | Import modul/tipe yang tidak dipakai di file |
| 2 | **Variabel tidak terpakai** | Variabel dideklarasi tapi tidak pernah dipakai |
| 3 | **Fungsi/konstanta tidak terpakai** | Fungsi/export yang tidak dipanggil dari mana pun |
| 4 | **Komponen React tidak terpakai** | Komponen di `components/` atau `app/` yang tidak di-import |
| 5 | **File tidak dipakai** | File `.ts/.tsx/.js/.jsx` yang tidak direferensikan |
| 6 | **Kode yang di-comment-out** | Blok kode lama yang dicomment (hapus kalau tidak relevan) |
| 7 | **`console.log` / `console.debug`** | Hapus log debug sebelum commit/deploy |
| 8 | **Endpoint/route lama** | Folder `app/api/*` yang tidak dipakai lagi |
| 9 | **Dependency tidak terpakai** | Paket di `package.json` yang tidak dipakai |
| 10 | **Type/interface tidak terpakai** | Tipe yang tidak dipakai (TypeScript) |
| 11 | **TODO/FIXME basi** | Hapus atau update kalau sudah selesai/tidak relevan |

> Jangan hapus kode yang **belum tentu** mati. Cek pemakaian dulu (bagian 3).

---

## 2. Perintah yang Dipakai

Semua dijalankan dari root project. Hasilnya dibaca dengan teliti.

| Perintah | Kegunaan | Catatan |
|---|---|---|
| `npx tsc --noEmit` | Cek tipe TypeScript (typecheck). Mendeteksi variabel/fungsi tak terpakai terkait tipe | Wajib lolos (lihat AGENT.md DoD) |
| `npx eslint . --max-warnings 0` | Cek lint (termasuk aturan unused vars/imports) | Baca warning/error, perbaiki yang relevan |
| `npx knip` | Mendeteksi unused files/exports/deps | Sangat berguna untuk pemula; baca output per file |
| `npx depcheck` | Mendeteksi unused dependencies | Cocok cross-check dengan knip |

> Kalau `knip`/`depcheck` belum terinstall, **JANGAN** tambahkan library baru tanpa alasan.
> Coba pakai kombinasi `eslint` + `tsc` + pencarian manual dulu.

---

## 3. Aturan "Aman Menghapus"

Ikuti langkah ini untuk setiap kandidat penghapusan:

1. **Temukan pemakaian** — Jangan langsung hapus. Cari nama file/fungsi/variabel dengan
   pencarian (glob/grep). Perhatikan import default/named.
2. **Cek konvensi** — Kadang dipakai via dynamic import? Sangat jarang di project ini. Kalau
   ada dynamic string, **jangan hapus** dulu.
3. **Jangan hapus kode yang diminta** — Ikuti aturan `AGENT.md`: "Jangan menghapus kode yang
   tidak diminta".
4. **Fokus pada dead code** — Hanya hapus yang benar-benar tidak dipakai.
5. **Jalankan build** — Setelah hapus, jalankan `npx tsc --noEmit` dan `npx eslint .` (kalau ada).
6. **Tes manual** — Coba jalankan dev server (`npm run dev`) dan tes alur penting (daftar,
   buat order, simulasi bayar, check-in) minimal yang relevan.
7. **Commit terpisah** — Buat commit terpisah dengan pesan jelas, mis.
   `chore: remove unused imports and dead code`.

> Kalau ragu, **biarkan saja**. Lebih aman daripada merusak fitur.

---

## 4. Kapan Clean-Up Dilakukan

Clean-up dilakukan pada momen berikut:

- **Di akhir tiap fase** — Setelah fase selesai & DoD terpenuhi (berjalan tanpa error, lint/typecheck
  lolos, komentar ok, dokumen diperbarui).
- **Sebelum deploy** — Cek cepat: `console.log` debug, import tidak terpakai, file tidak dipakai.
- **Setelah refactor** — Kalau mengubah nama file/fungsi, pastikan tidak ada sisa referensi lama.

> Clean-up **bukan** fase tersendiri untuk nambah fitur. Hanya merapikan.

---

## 5. Template Laporan Clean-Up Singkat

Gunakan template ini di ringkasan setelah selesai fase (sesuai `AGENT.md` aturan 5).

```text
## Clean-up (dead code)
Tanggal: YYYY-MM-DD
Fase: [nama fase]

Yang dibersihkan:
- File dihapus: [nama file / jumlah]
- Import/fungsi tak terpakai dibersihkan: [deskripsi singkat]
- console.log debug dihapus: [file]
- Dependency tak terpakai: [nama paket / "tidak ada"]

Perintah yang dijalankan:
- npx tsc --noEmit → [lolos/gagal]
- npx eslint . → [lolos/gagal]
- (opsional) npx knip/depcheck

Hasil tes manual:
- [daftar alur yang dites, mis. events list, checkout simulasi]

Catatan: [kalau ada yang tidak dihapus karena ragu]
```

Contoh ringkas:

```text
Clean-up: hapus 2 import tak terpakai di lib/services/order-service.ts.
tsc --noEmit: pass. eslint: pass. Tes manual: buat order simulasi berhasil.
```

---

## 6. Dokumen Terkait

- `docs/logging.md` — aturan hapus `console.log` debug
- `docs/architecture.md` — struktur folder untuk cek file tak terpakai
- `docs/api-contract.md` — cek endpoint lama
- `docs/AGENT.md` — Definition of Done & aturan kerja
