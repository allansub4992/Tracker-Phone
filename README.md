# 📍 Location Tracker

Aplikasi self-hosted untuk melacak lokasi GPS perangkat secara real-time.

## ✨ Fitur

- 🗺️ **Dashboard Real-time** - Lihat lokasi semua perangkat di peta
- 📱 **Mobile Tracker** - Halaman responsif untuk HP yang mengirim lokasi GPS
- 📍 **Location History** - Lihat riwayat lokasi dan path perjalanan
- 🔋 **Battery Status** - Monitoring status baterai perangkat
- 🌙 **Dark Mode** - UI modern dengan tampilan gelap

## 🚀 Instalasi

### Prasyarat
- Node.js v16 atau lebih baru
- npm

### Langkah Instalasi

1. **Extract atau clone project**

2. **Install dependencies**
   ```bash
   cd location-tracker
   npm install
   ```

3. **Jalankan server**
   ```bash
   npm start
   ```

4. **Akses aplikasi**
   - Dashboard: `http://localhost:3000`
   - Tracker: `http://localhost:3000/tracker`

## 📱 Cara Penggunaan

### Setup Tracker di HP

1. Buka `http://[IP-SERVER]:3000/tracker` di browser HP
2. Atur nama perangkat (misal: "HP Allan")
3. Atur interval update (5-60 detik)
4. Klik **"Mulai Tracking"**
5. Izinkan akses lokasi saat diminta

### Melihat Lokasi di Dashboard

1. Buka `http://[IP-SERVER]:3000` di browser PC/laptop
2. Lihat semua perangkat yang terdaftar di sidebar
3. Klik perangkat untuk zoom ke lokasi
4. Klik **"History"** untuk melihat riwayat perjalanan

## 🔧 Deployment

### Menggunakan PM2 (Recommended)

```bash
npm install -g pm2
pm2 start server.js --name location-tracker
pm2 save
pm2 startup
```

### Menggunakan Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Menggunakan Cloudflare Tunnel (untuk akses public)

1. Install cloudflared
2. Jalankan tunnel:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

## ⚠️ Catatan Penting

### HTTPS untuk GPS
Browser modern memerlukan **HTTPS** untuk mengakses GPS (kecuali localhost). Opsi:
- Gunakan Cloudflare Tunnel (otomatis HTTPS)
- Setup reverse proxy dengan SSL (nginx + certbot)
- Untuk testing lokal, gunakan `localhost`

### Battery Saving
- Interval 30-60 detik direkomendasikan untuk hemat baterai
- HP harus tetap aktif (tidak sleep) untuk tracking berjalan

### Storage
- Data lokasi disimpan di file JSON (`data/locations.json`)
- Maksimal 1000 lokasi per perangkat disimpan

## 📁 Struktur File

```
location-tracker/
├── server.js           # Backend server
├── package.json        # Dependencies
├── public/
│   ├── dashboard.html  # Dashboard web UI
│   └── tracker.html    # Mobile tracker page
└── data/
    └── locations.json  # Location data storage
```

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/location` | Kirim lokasi baru |
| GET | `/api/devices` | List semua perangkat |
| GET | `/api/devices/:id/history` | History lokasi perangkat |
| DELETE | `/api/devices/:id` | Hapus perangkat |
| DELETE | `/api/devices/:id/history` | Clear history |

## 🛠️ Troubleshooting

### GPS tidak berfungsi di HP
- Pastikan browser punya izin lokasi
- Pastikan GPS aktif di HP
- Gunakan HTTPS atau localhost

### Lokasi tidak update
- Cek koneksi internet
- Pastikan server URL benar di tracker
- Lihat log di halaman tracker

### Akurasi lokasi buruk
- Aktifkan GPS/Location di HP
- Pindah ke area terbuka
- Tunggu beberapa detik untuk lock GPS

---

Made with ❤️ for personal use only.
