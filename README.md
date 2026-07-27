# E-TA Tools 🎓

<div align="center">

![E-TA Tools Banner](csv-generator/assets/logo.png)

### Automation Utility & CSV Generator for E-TA FT UNMUL

[![Live Demo](https://img.shields.io/badge/Live_Web_App-miezlearning.github.io%2Fe--ta%2F-orange?style=for-the-badge&logo=googlechrome&logoColor=white)](https://miezlearning.github.io/e-ta/)
[![Extension](https://img.shields.io/badge/Chrome_Extension-v1.0.0-blue?style=for-the-badge&logo=googlechrome&logoColor=white)](https://miezlearning.github.io/e-ta/extension.zip)
[![Tampermonkey](https://img.shields.io/badge/Userscript-Tampermonkey-green?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://raw.githubusercontent.com/miezlearning/e-ta-tools/main/skrip.js)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*Capek menginput data bimbingan satu per satu di portal E-TA FT UNMUL? **E-TA Tools** hadir sebagai solusi otomatisasi bulk-fill cerdas berbasis CSV.*

</div>

---

## 📌 Daftar Isi (Table of Contents)

- [✨ Ringkasan Fitur Utama](#-ringkasan-fitur-utama)
- [🌐 Akses Web App Live](#-akses-web-app-live)
- [🚀 Panduan Penggunaan Lengkap](#-panduan-penggunaan-lengkap)
  - [Langkah 1: Siapkan Extension / Script](#langkah-1-siapkan-extension--script)
  - [Langkah 2: Konfigurasi Pembimbing & Data di Generator CSV](#langkah-2-konfigurasi-pembimbing--data-di-generator-csv)
  - [Langkah 3: Auto-Generate Uraian Akademis dengan AI](#langkah-3-auto-generate-uraian-akademis-dengan-ai)
  - [Langkah 4: Unduh CSV & Import ke Extension](#langkah-4-unduh-csv--import-ke-extension)
- [⚙️ Fitur Kustom: Mode Tampilan & Efek Suara](#️-fitur-kustom-mode-tampilan--efek-suara)
- [💡 Panduan Pengisian & Shortcut](#-panduan-pengisian--shortcut)
- [❓ FAQ (Frequently Asked Questions)](#-faq-frequently-asked-questions)
- [🔒 Privasi & Keamanan Data](#-privasi--keamanan-data)
- [🛠️ Tech Stack & Arsitektur](#️-tech-stack--arsitektur)
- [🤝 Kontribusi & Lisensi](#-kontribusi--lisensi)

---

## ✨ Ringkasan Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| **🌐 Generator CSV Modern** | UI Glassmorphism ultra-fast tanpa framework, tanpa reload, dan penuh animasi smooth. |
| **✨ AI Auto-Generate Uraian** | Integrasi AI akademis gratis untuk membuat deskripsi catatan konsultasi otomatis. |
| **📅 Custom Date Picker** | Kalender kustom modern bertema gelap/terang tanpa komponen OS jadul. |
| **🔽 Custom Dropdown Select** | Dropdown pilihan Posisi dan Pembimbing kustom dengan pendaran neon oranye. |
| **🌙 Dark & Light Mode** | Dukungan penuh mode tampilan Gelap, Terang, dan sinkronisasi otomatis Ikuti Sistem OS. |
| **🔊 Custom Sound Effects** | Efek suara sintetis Web Audio API dengan preset interaktif & kustom MP3. |
| **🧩 Multi-Format Import** | Mendukung Chrome Extension (.zip) dan Script Tampermonkey untuk fleksibilitas. |

---

## 🌐 Akses Web App Live

Buka Generator CSV langsung dari browser Anda tanpa instalasi server:

👉 **[miezlearning.github.io/e-ta/](https://miezlearning.github.io/e-ta/)**

---

## 🚀 Panduan Penggunaan Lengkap

```
1. Pasang Extension/Script ➔ 2. Susun Data di Web App ➔ 3. Unduh CSV ➔ 4. Import & Jalankan di E-TA Portal
```

### Langkah 1: Siapkan Extension / Script

Pilih salah satu metode otomatisasi yang Anda sukai:

#### Pilihan A: Chrome Extension (Rekomendasi)
1. Unduh file package extension: [**Pasang Extension (.zip)**](https://miezlearning.github.io/e-ta/extension.zip).
2. Ekstrak file `.zip` tersebut di komputer Anda.
3. Buka browser Chrome / Edge / Brave / Opera dan navigasi ke `chrome://extensions`.
4. Aktifkan **Developer mode** di pojok kanan atas.
5. Klik **Load unpacked** dan pilih folder hasil ekstrak extension.

#### Pilihan B: Script Tampermonkey
1. Pastikan browser Anda sudah memiliki extension [Tampermonkey](https://www.tampermonkey.net/).
2. Klik link skrip: [**Install Tampermonkey Script**](https://raw.githubusercontent.com/miezlearning/e-ta-tools/main/skrip.js).
3. Klik tombol **Install** di tab Tampermonkey.

---

### Langkah 2: Konfigurasi Pembimbing & Data di Generator CSV

1. Buka **[miezlearning.github.io/e-ta/](https://miezlearning.github.io/e-ta/)**.
2. **Atur Pembimbing**: Pada panel `1. Pilih Dosen Pembimbing`, ketik nama atau NIP Dosen Pembimbing 1 dan Pembimbing 2. Rekomendasi nama dosen akan muncul secara otomatis.
3. **Isi Baris Bimbingan**:
   - Pilih tanggal bimbingan menggunakan **Custom Datepicker Calendar**.
   - Pilih Posisi bimbingan (`Proposal`, `Hasil`, atau `Pendadaran`).
   - Pilih Dosen (`P1` atau `P2`). Teks nama dosen akan terisi otomatis.

> [!TIP]
> Gunakan tombol duplikat pada kolom aksi untuk mempercepat pembuatan baris bimbingan yang memiliki pola serupa.

---

### Langkah 3: Auto-Generate Uraian Akademis dengan AI

Bingung menyusun kalimat deskripsi bimbingan?
1. Klik tombol **Sparkles AI** (`✨`) di sebelah kanan kolom uraian.
2. AI akademis terintegrasi akan secara otomatis membuat 1 kalimat deskripsi bimbingan yang natural dan sesuai dengan posisi bimbingan (Proposal / Hasil / Skripsi).
3. Tanpa perlu API Key, 100% gratis.

---

### Langkah 4: Unduh CSV & Import ke Extension

1. Setelah semua baris bimbingan terisi lengkap, klik tombol **Unduh CSV**.
2. Buka portal resmi **E-TA FT UNMUL** di browser Anda dan login.
3. Buka ikon Extension E-TA Tools di toolbar browser.
4. Klik **Import CSV**, pilih file CSV yang baru diunduh, lalu klik **Mulai**.
5. Extension akan mengisi dan mengirim form bimbingan satu demi satu secara otomatis.

> [!IMPORTANT]
> Selalu periksa kembali pratinjau data bimbingan sebelum menjalankan tombol submit otomatis di portal E-TA.

---

## ⚙️ Fitur Kustom: Mode Tampilan & Efek Suara

Klik tombol ikon Pengaturan (⚙️) di pojok kanan bawah aplikasi untuk membuka modal konfigurasi:

- **Mode Tampilan**:
  - 🌙 **Dark Mode**: Tema gelap futuristik dengan kontras tinggi (Default).
  - ☀️ **Light Mode**: Tema terang bersih dengan bayangan lembut.
  - 💻 **Ikuti Sistem**: Menyesuaikan secara otomatis dengan pengaturan tema OS Anda.
- **Efek Suara (Web Audio API Synth)**:
  - Preset suara interaktif (*Soft Accent, Cyberpunk Synth, Retro Arcade, Mute*).
  - Opsi tautan URL MP3 kustom dari [MyInstants](https://www.myinstants.com).

---

## 💡 Panduan Pengisian & Shortcut

Website ini dilengkapi dengan **Panduan Pengisian (Tour Guide)** yang dapat diakses kapan saja:
- Klik tombol **Panduan Pengisian** di bagian header hero.
- Gunakan tombol keyboard berikut saat Tour berlangsung:
  - <kbd>→</kbd> / <kbd>Enter</kbd> : Lanjut ke langkah berikutnya.
  - <kbd>←</kbd> : Kembali ke langkah sebelumnya.
  - <kbd>Esc</kbd> : Menutup panduan pengisian.

---

## ❓ FAQ (Frequently Asked Questions)

<details>
<summary><b>Q: Apakah data bimbingan saya dikirim ke server luar?</b></summary>
<br>

**Tidak.** Seluruh data disimpan dan diproses secara lokal di browser Anda (*local storage*). Tidak ada server perantara yang menyimpan data Anda.
</details>

<details>
<summary><b>Q: Bagaimana jika saya salah menginput data CSV?</b></summary>
<br>

Data yang sudah terkirim ke portal E-TA harus dihapus secara manual di portal E-TA. Oleh karena itu, disarankan untuk menguji 1 baris bimbingan terlebih dahulu sebelum melakukan bulk submit.
</details>

<details>
<summary><b>Q: Apakah aplikasi ini mendukung browser di HP?</b></summary>
<br>

Website Generator CSV dapat dibuka di HP, namun Extension Chrome auto-fill hanya dapat berjalan di browser desktop (Chrome, Edge, Brave, Opera).
</details>

---

## 🔒 Privasi & Keamanan Data

- **Zero Remote Storage**: Data bimbingan dan preferensi Anda tidak pernah diunggah ke server pihak ketiga.
- **Client-Side Automation**: Extension dan skrip berjalan sepenuhnya di dalam konteks tab browser Anda.

---

## 🛠️ Tech Stack & Arsitektur

- **Frontend**: Vanilla HTML5, Custom CSS3 Design System, Modern ES6 JavaScript.
- **Components**: Custom Glassmorphism Tooltip Engine, Custom Datepicker Popover, Custom Dropdown Select, Web Audio API Synth.
- **Automation**: Chrome Extension Manifest V3 & Tampermonkey Userscript Bridge.
- **Hosting**: GitHub Pages (`miezlearning.github.io/e-ta/`).

---

## 🤝 Kontribusi & Lisensi

Kontribusi dan saran perbaikan selalu terbuka! Silakan buka Issue atau kirimkan Pull Request pada repository ini.

Didistribusikan di bawah **Lisensi MIT**. Lihat [LICENSE](LICENSE) untuk informasi lebih lanjut.

<div align="center">

---

*Dikembangkan dengan ☕ untuk mempermudah masa bimbingan mahasiswa FT UNMUL.*

**[🌐 Buka E-TA Tools Live](https://miezlearning.github.io/e-ta/)**

</div>
