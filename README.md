# Math Obby: Ultimate Math Challenge 🎮📐
**Permainan Pendidikan 3D Obby Matematik Tingkatan 1 (KSSM)**

Permainan 3D interaktif yang diinspirasikan oleh gaya obby Roblox, direka khas untuk topik **Nisbah, Kadar dan Kadaran** berdasarkan Dokumen Standard Kurikulum dan Pentaksiran (DSKP) Matematik Tingkatan 1.

---

## 🌟 Standard Pembelajaran (DSKP) & Mekanik Halangan 3D

Permainan dibahagikan kepada 4 zon cabaran (16 soalan keseluruhan):

1. **Zon 1: SP 4.4.1 (Ratio Gate)** — *Menentukan nisbah tiga kuantiti apabila dua atau lebih nisbah dua kuantiti diberi.*
   - **Mekanik 3D:** 3 Pintu gerbang fizikal (A, B, C). Pemain berlari menembusi pintu pilihan.
2. **Zon 2: SP 4.4.2 (Ratio Floor)** — *Menentukan nisbah atau nilai berkaitan berdasarkan nisbah kuantiti yang diberi.*
   - **Mekanik 3D:** Platform terapung merentasi jurang dengan label lantai pilihan A, B, dan C.
3. **Zon 3: SP 4.4.3 (Rate Rush)** — *Menentukan nilai yang berkaitan dengan suatu kadar.*
   - **Mekanik 3D:** Platform terapung yang berayun dan bergerak secara dinamik.
4. **Zon 4: SP 4.4.4 (Falling Tiles)** — *Menyelesaikan masalah yang melibatkan nisbah, kadar dan kadaran, termasuk membuat anggaran.*
   - **Mekanik 3D:** Tiga jubin lantai terapung (A, B, C). Memijak jubin yang salah akan menyebabkan lantai runtuh ke bawah dan pemain diteleportkan ke Starting Point SP 4!
5. **Garisan Penamat & Trofi Kemenangan:** Peringkat puncak dengan piala pusingan emas 3D dan partikel konfeti!

---

## 🕹️ Kawalan Permainan

### Komputer (PC / Komputer Riba):
- **W, A, S, D** atau **Kekunci Anak Panah**: Bergerak ke hadapan, belakang, kiri dan kanan.
- **Shift / B / E**: ⚡ Boost Kelajuan (Pecutan).
- **Spacebar (Bar Ruang)**: ⬆ Melompat.
- **Escape (Esc)**: Jeda permainan.

### Telefon Pintar / Tablet:
- **Kayu Ria Maya (Virtual Joystick)** di bahagian bawah kiri untuk kawalan arah 360 darjah.
- **Butang BOOST** di bahagian bawah kanan untuk pecutan pantas.
- **Butang LOMPAT** di bahagian bawah kanan untuk lompatan tinggi.

---

## 🏆 Peraturan Markah & Masa

- **Masa Menjawab:** 25 saat setiap soalan (bar masa bertukar merah pada 6 saat terakhir).
- **Jawapan Betul:** +100 Mata, penjelasan konsep dipaparkan, terus mara ke soalan seterusnya.
- **Jawapan Salah:** -10 Mata, kembali ke soalan pertama bagi SP semasa sahaja (SP terdahulu kekal selesai).
- **Masa Tamat (25s):** -10 Mata, jawapan betul dipaparkan, mara ke soalan seterusnya tanpa mengulang SP.
- **Terjatuh ke Ruang Kosong:** Dihidupkan semula di checkpoint semasa tanpa sebarang penalti markah.
- **Simpanan Rekod:** Markah tertinggi dan masa terpantas disimpan secara automatik menggunakan `localStorage`.

---

## 🚀 Panduan Menjalankan, Menguji & Menerbitkan (Bahasa Melayu)

### 1. Menjalankan Projek di Komputer Sendiri (Local Development)
Pastikan anda telah memasang **Node.js** (versi 18 ke atas):
```bash
# 1. Pasang semua pakej dependensi
npm install

# 2. Jalankan pelayan pembangunan tempatan
npm run dev
```
Buka pelayar web dan layari `http://localhost:3000` untuk memulakan permainan.

---

### 2. Menguji dan Membina Projek (Build)
Uji kesahihan TypeScript dan bina fail pengeluaran yang dioptimumkan:
```bash
# Semak ralat sintaks dan jenis
npm run lint

# Bina fail pengeluaran statik ke folder /dist
npm run build
```
Hasil binaan akan berada di dalam folder `dist/` dan sedia untuk dihoskan di mana-mana pelayan web.

---

### 3. Cara Menerbitkan ke GitHub Pages Secara Percuma

Permainan ini 100% menggunakan fail statik HTML, CSS, JavaScript (Three.js) dan Web Audio API tanpa sebarang backend berbayar. Ini menjadikannya amat sesuai untuk **GitHub Pages**.

#### Langkah-langkah:
1. **Tetapkan Base Path di `vite.config.ts`**:
   Sekiranya repositori GitHub anda bernama `math-obby`, pastikan tetapan `base` ditetapkan dalam `vite.config.ts`:
   ```ts
   export default defineConfig({
     base: './', // Menggunakan path relatif supaya berfungsi di mana-mana subfolder GitHub Pages
     // ... tetapan sedia ada ...
   });
   ```

2. **Muat Naik ke Repositori GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Bina permainan Math Obby 3D"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO.git
   git push -u origin main
   ```

3. **Aktifkan GitHub Pages melalui GitHub Actions**:
   Di repositori GitHub anda:
   - Pergi ke tab **Settings** > **Pages**.
   - Di bawah **Build and deployment** > **Source**, pilih **GitHub Actions**.
   - Gunakan templat lalai **Static HTML / Vite** yang disediakan oleh GitHub.
   - Selepas proses selesai, pautan permainan anda akan tersedia di `https://USERNAME_ANDA.github.io/NAMA_REPO/`.

4. **Kaedah Alternatif Menggunakan Pakej `gh-pages`**:
   ```bash
   npm install --save-dev gh-pages
   ```
   Tambah skrip berikut dalam `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
   Kemudian jalankan:
   ```bash
   npm run deploy
   ```
