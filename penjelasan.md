# 📱 ImuniKids Mobile — Dokumentasi Lengkap

> **Dibuat oleh: Zeetasi**
> Aplikasi mobile edukasi imunisasi anak berbasis React Native + Expo

---

## 🧩 Aplikasi Ini Berbasis Apa?

| Komponen | Teknologi |
|---|---|
| **Framework Utama** | React Native (JavaScript/TypeScript) |
| **Platform Builder** | Expo SDK 54 |
| **Navigasi** | Expo Router v6 (file-based routing) |
| **Database & Auth** | Firebase Realtime Database |
| **Video Player** | react-native-webview (YouTube Embed) |
| **Notifikasi** | expo-notifications |
| **Animasi Splash** | expo-av (video MP4) |
| **Font Kustom** | StickyBread, Oswald, Chocolate, Inter |
| **Target Platform** | Android & iOS |

---

## 📂 Struktur Fitur Aplikasi

```
app/
├── index.tsx          → Splash screen (animasi video)
├── login.tsx          → Halaman login
├── register.tsx       → Halaman daftar akun baru
├── home.tsx           → Dashboard utama
├── checklist.tsx      → Checklist imunisasi anak
├── reminder.tsx       → Daftar pengingat imunisasi
├── atur-pengingat.tsx → Buat & atur jadwal pengingat
├── rekomendasi.tsx    → Rekomendasi imunisasi
├── video.tsx          → Video edukasi (YouTube in-app)
├── webview.tsx        → Player video & browser in-app
└── konten.tsx         → Konten artikel edukasi
```

---

## 🛠️ Cara Install & Menjalankan di Komputer

### 1. Persiapan — Install Node.js & tools

Download dan install:
- **Node.js** v18 ke atas → https://nodejs.org
- **pnpm** (package manager):
  ```bash
  npm install -g pnpm
  ```
- **Expo CLI**:
  ```bash
  npm install -g expo-cli eas-cli
  ```

### 2. Clone / Extract Project

Extract file ZIP ini ke folder di komputer kamu, misalnya:
```
C:\Users\NamaKamu\imunikids\
```

### 3. Install Dependencies

Buka terminal di folder project, lalu jalankan:
```bash
pnpm install
```

Tunggu hingga selesai (bisa 2–5 menit pertama kali).

### 4. Jalankan di HP untuk Preview

```bash
npx expo start
```

Lalu:
- Install **Expo Go** di HP Android dari Play Store
- Scan QR code yang muncul di terminal
- Aplikasi langsung muncul di HP kamu ✅

---

## 📦 Cara Build Jadi File APK (Android)

### Langkah 1 — Buat akun Expo (gratis)

Daftar di → https://expo.dev

### Langkah 2 — Login di terminal

```bash
eas login
```
Masukkan email & password akun Expo kamu.

### Langkah 3 — Inisialisasi EAS Build

```bash
eas build:configure
```
Jawab pertanyaan yang muncul:
- Platform → pilih **Android**
- Akan dibuat file `eas.json` otomatis

### Langkah 4 — Build APK (untuk testing)

```bash
eas build -p android --profile preview
```

Proses build berlangsung di server Expo (cloud), sekitar **10–20 menit**.
Setelah selesai, kamu akan dapat **link download APK**.

### Langkah 5 — Install APK ke HP

- Download file `.apk` dari link yang diberikan
- Kirim ke HP via WhatsApp / kabel / Google Drive
- Di HP: Pengaturan → Keamanan → Izinkan Sumber Tidak Dikenal
- Install APK → selesai ✅

---

## 🏪 Cara Upload ke Google Play Store (Opsional)

Kalau ingin publish ke Play Store, gunakan profile `production`:

```bash
eas build -p android --profile production
```

Ini akan menghasilkan file `.aab` (Android App Bundle) yang bisa diupload ke Google Play Console.

> ⚠️ Upload ke Play Store membutuhkan akun **Google Play Developer** (biaya pendaftaran $25 sekali bayar).

---

## 🔥 Konfigurasi Firebase

Aplikasi ini menggunakan Firebase Realtime Database.
Konfigurasi ada di: `context/firebase.ts`

Database URL: `https://imunikids-b523a-default-rtdb.firebaseio.com`

Jika ingin ganti ke project Firebase sendiri:
1. Buka https://console.firebase.google.com
2. Buat project baru
3. Copy konfigurasi ke `context/firebase.ts`

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---|---|
| `pnpm install` error | Pastikan Node.js sudah versi 18+ |
| QR code tidak bisa di-scan | Pastikan HP & laptop satu jaringan WiFi |
| Video tidak putar di preview web | Normal — video hanya berjalan di HP (Android/iOS) |
| Notifikasi tidak muncul | Izinkan notifikasi saat pertama kali buka app |
| Build APK gagal | Cek koneksi internet & login ulang dengan `eas login` |

---

## 📞 Kontak

Dibuat dan dikembangkan oleh **Zeetasi**

---

*Dokumentasi ini dibuat untuk memudahkan proses instalasi, pengembangan, dan build aplikasi ImuniKids Mobile.*
