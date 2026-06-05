# Panduan Penggunaan Extension

## Alur Kerja

```
Buat CSV → Import di Extension → Extension isi form E-TA → Auto submit
```

## 1. Menyiapkan File CSV

### Format CSV

```csv
tanggal,posisi,dosen,uraian
05-06-2026,Proposal,198209012009122003,Revisi BAB 1
06-06-2026,Hasil,199107272023211025,Diskusi metodologi
```

### Kolom

| Kolom | Isi | Contoh |
|-------|-----|--------|
| `tanggal` | Tanggal bimbingan (DD-MM-YYYY, DD/MM/YYYY, atau YYYY-MM-DD) | `05-06-2026` |
| `posisi` | Jenis bimbingan: `Proposal`, `Hasil`, atau `Pendadaran` | `Proposal` |
| `dosen` | NIP/value dosen dari dropdown E-TA | `199107272023211025` |
| `uraian` | Isi/catatan bimbingan | `Revisi BAB 1 pendahuluan` |

### Cara Mendapatkan NIP Dosen

1. Buka website generator CSV di [eta.miez.site](https://eta.miez.site)
2. Scroll ke bagian **"Daftar Dosen"**
3. Cari dosen menggunakan kolom pencarian
4. Klik NIP (angka oranye) untuk meng-copy

### Membuat CSV

**Opsi A — Pakai website generator:**
1. Buka [eta.miez.site](https://eta.miez.site)
2. Isi baris-baris bimbingan di tabel
3. Klik **"Unduh CSV"**

**Opsi B — Manual:**
Buat file `.csv` dengan text editor. Pastikan pakai comma (`,`) sebagai separator.

## 2. Menggunakan Extension

### Buka Extension

1. Buka halaman E-TA di Chrome: `https://e-office.ft.unmul.ac.id/mahasiswa/e-ta/`
2. Pastikan sudah login dan berada di halaman input bimbingan
3. Klik ikon extension di toolbar Chrome

### Import CSV

1. Klik area **"File CSV"** di popup extension
2. Pilih file `.csv` yang sudah disiapkan
3. Status akan menunjukkan jumlah baris terbaca (misal: "Terbaca 5 baris")
4. Panel riwayat menampilkan preview semua baris

### Pilih Mode

- **Auto Submit ON** (default): Extension isi form → submit → reload → isi form berikutnya → dst. Semua baris diproses otomatis.
- **Auto Submit OFF**: Extension hanya mengisi 1 baris di form. Kamu submit manual, lalu klik "Mulai" lagi untuk baris berikutnya.

### Mulai Proses

1. Klik tombol **"▶ Mulai"**
2. Progress bar akan berjalan
3. Riwayat menunjukkan status per baris:
   - ● = menunggu
   - ▶ = sedang diisi (berkedip)
   - ✓ = berhasil
4. Tunggu sampai semua baris selesai

### Menghentikan Proses

Klik tombol **"■ Stop"** kapan saja untuk menghentikan. Baris yang sudah tersubmit tidak bisa di-undo.

## 3. Monitoring Progress

Popup extension menampilkan:
- **Progress bar** — persentase visual
- **Counter** — "3 / 10" (baris ke-3 dari 10)
- **Status text** — "Mengisi baris 4..." atau "Selesai!"
- **Riwayat** — daftar semua baris dengan status masing-masing

Kamu bisa menutup popup lalu buka lagi — progress tetap terpantau selama tab E-TA masih terbuka.

## Tips & Best Practice

1. **Jangan tutup tab E-TA** selama proses auto-submit berjalan
2. **Jangan navigate** ke halaman lain di tab yang sama
3. **Cek koneksi internet** — jika koneksi putus saat submit, baris tersebut mungkin gagal
4. **Test dulu dengan 1-2 baris** sebelum bulk submit banyak data
5. **Gunakan fitur duplikat** di website generator kalau banyak baris dengan dosen/posisi sama

## Contoh Skenario

### Input 10 baris bimbingan sekaligus

1. Buat CSV 10 baris di website generator
2. Download CSV
3. Buka E-TA, klik extension
4. Import CSV → "Terbaca 10 baris"
5. Pastikan Auto Submit ON
6. Klik "Mulai"
7. Tunggu ~30 detik (tiap baris ±3 detik)
8. Selesai!

### Input manual per baris (review dulu)

1. Import CSV
2. **Uncheck** Auto Submit
3. Klik "Mulai" → form terisi
4. Review isi form di halaman E-TA
5. Kalau sudah benar, submit manual
6. Baris selanjutnya otomatis terisi setelah reload

## Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| Dosen tidak terpilih | NIP salah atau tidak ada di dropdown | Cek NIP di daftar dosen website |
| Tanggal tidak terisi | Format tidak dikenali | Pakai format DD-MM-YYYY |
| CKEditor tidak terisi | Editor belum sempat load | Tunggu halaman full load, coba lagi |
| Progress stuck | Tab E-TA tertutup/navigate | Buka kembali halaman E-TA, proses lanjut otomatis jika queue masih ada |
| "Gagal kirim" di popup | Content script belum inject | Refresh halaman E-TA, coba lagi |
