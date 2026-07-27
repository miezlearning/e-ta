# E-TA Tools 🎓

**Capek input bimbingan satu-satu di E-TA? Sama.**

Tools ini bantu kamu input data bimbingan secara bulk ke sistem E-TA FT UNMUL. Tinggal siapin CSV, klik tombol, duduk manis — extension yang kerja.

---

## Apa Aja Isinya?

| Tool | Fungsi |
|------|--------|
| 🌐 **Website Generator CSV** | Bikin file CSV dari browser, lengkap dengan daftar dosen + NIP |
| 🧩 **Chrome Extension** | Auto-fill form bimbingan di E-TA dari CSV, bisa auto-submit juga |

---

## Gimana Cara Kerjanya?

```
Bikin CSV (di website) → Import ke Extension → Extension isi form → Auto submit → Repeat sampai habis
```

Simpelnya:
1. Kamu bikin daftar bimbingan dalam format CSV
2. Extension baca CSV itu
3. Form di E-TA keisi otomatis per baris
4. Kalau auto-submit nyala, langsung diklik submit juga — lanjut baris berikutnya

---

## Quick Start

### 1. Download & Install Extension

Tidak perlu download seluruh repository! Kamu bisa download file ZIP extension langsung:

* 🧩 [**Download Extension (.zip)**](https://eta.miez.site/extension.zip) *(Rekomendasi Chrome/Edge/Brave)*
* 📜 [**Install Tampermonkey Script**](https://raw.githubusercontent.com/miezlearning/e-ta-tools/main/skrip.js) *(Alternatif 1-klik)*

👉 [**Panduan Instalasi Lengkap**](docs/INSTALL.md)

Cuma butuh 1-2 menit. Tinggal extract ZIP → load folder ke Chrome, selesai.

### 2. Siapin CSV

Buka website generator buat bikin CSV-nya:

🌐 [**eta.miez.site**](https://eta.miez.site)

Di situ ada:
- Form input dengan date picker, dropdown posisi, dan kolom dosen
- Daftar lengkap dosen + NIP (bisa search, klik untuk copy)
- Tombol duplikat baris biar cepat
- Download CSV langsung

Atau kalau mau bikin manual di Excel/Notepad juga bisa. Format:

```csv
tanggal,posisi,dosen,uraian
05-06-2026,Proposal,198209012009122003,Revisi BAB 1
06-06-2026,Hasil,199107272023211025,Diskusi metodologi
```

### 3. Jalankan

Buka halaman E-TA → klik extension → import CSV → klik Mulai → selesai.

Detail lengkap ada di:

👉 [**Panduan Penggunaan**](docs/USAGE.md)

---

## Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [📥 Instalasi](docs/INSTALL.md) | Cara install extension di Chrome step-by-step |
| [📖 Penggunaan](docs/USAGE.md) | Cara pakai extension, bikin CSV, monitoring progress |

---

## FAQ

**Q: Aman ga nih? Data saya kemana?**
> Semua diproses lokal di browser kamu. Ga ada data yang dikirim ke server manapun selain ke E-TA itu sendiri.

**Q: Bisa di HP?**
> Belum. Chrome extension cuma jalan di desktop.

**Q: Kalau salah input gimana?**
> Yang sudah tersubmit harus dihapus manual di E-TA. Makanya test dulu dengan 1-2 baris sebelum bulk.

**Q: Extension-nya error / form ga keisi**
> Refresh halaman E-TA, reload extension di `chrome://extensions`, coba lagi. Kalau masih gagal, buka issue di repo ini.

**Q: NIP dosen mana yang dipakai?**
> Pakai value/NIP dari dropdown di halaman E-TA. Daftar lengkapnya ada di website generator.

---

## Tech Stack

- **Website**: Vanilla HTML/CSS/JS (no framework, no build step)
- **Extension**: Chrome Manifest V3, content script + page bridge
- **Hosting**: GitHub Pages dengan custom domain

---

## Kontribusi

Nemu bug? Punya ide? Buka issue atau langsung PR aja. Ini project santai, ga ada aturan kontribusi yang ribet.

---

## Disclaimer

Tools ini dibuat untuk mempermudah proses input bimbingan yang repetitif. Gunakan dengan bijak. Pastikan data yang kamu input benar sebelum bulk submit — yang sudah masuk susah di-undo.

---

<p align="center">
  <sub>Made with ☕ biar ga cape input satu-satu</sub>
</p>
