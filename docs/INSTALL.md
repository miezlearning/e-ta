# Instalasi Extension

## Persyaratan

- Google Chrome atau browser berbasis Chromium (Edge, Brave, dll)
- Akses ke halaman E-TA FT UNMUL (`https://e-office.ft.unmul.ac.id/mahasiswa/e-ta/`)

## Langkah Instalasi

### 1. Download Extension

Download atau clone folder `extension/` dari repository ini.

```
extension/
├── manifest.json
├── content.js
├── page.js
├── popup.html
├── popup.css
└── popup.js
```

### 2. Buka Halaman Extensions di Chrome

1. Buka Chrome
2. Ketik `chrome://extensions` di address bar, lalu Enter
3. Aktifkan **Developer mode** (toggle di pojok kanan atas)

### 3. Load Extension

1. Klik tombol **"Load unpacked"** (Muat yang belum dikemas)
2. Pilih folder `extension/` yang sudah di-download
3. Extension akan muncul di daftar dengan nama **"E-TA FT UNMUL Bulk Bimbingan"**

### 4. Pin Extension (Opsional)

1. Klik ikon puzzle (Extensions) di toolbar Chrome
2. Klik ikon pin di samping "E-TA FT UNMUL Bulk Bimbingan"
3. Ikon extension sekarang selalu terlihat di toolbar

## Verifikasi Instalasi

1. Buka halaman E-TA: `https://e-office.ft.unmul.ac.id/mahasiswa/e-ta/`
2. Klik ikon extension di toolbar
3. Popup "Bulk Bimbingan" akan muncul — artinya instalasi berhasil

## Update Extension

Jika ada update kode:

1. Replace file-file di folder `extension/` dengan versi terbaru
2. Buka `chrome://extensions`
3. Klik ikon reload (🔄) pada card extension
4. Refresh halaman E-TA yang sedang terbuka

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Extension tidak muncul | Pastikan Developer mode aktif dan folder yang dipilih benar (yang berisi `manifest.json`) |
| Popup error "Gagal kirim" | Pastikan halaman E-TA sedang terbuka dan sudah login |
| Form tidak terisi | Refresh halaman E-TA, lalu coba lagi |
| Select2/Dosen tidak ke-set | Reload extension di `chrome://extensions`, lalu refresh halaman E-TA |

## Uninstall

1. Buka `chrome://extensions`
2. Cari "E-TA FT UNMUL Bulk Bimbingan"
3. Klik **"Remove"** (Hapus)
