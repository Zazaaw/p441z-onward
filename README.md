# Onward

Maju sedikit setiap hari. Satu hari lebih baik dari kemarin.

Alat pribadi satu-pengguna untuk mencatat kehadiran harian dan memantau
rekapnya. Dibangun dengan Next.js (App Router) + Supabase.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev
```

Buka http://localhost:3000 — semua rute dilindungi, jadi kamu akan diarahkan
ke `/login` lebih dulu.

## Variabel lingkungan

Lihat [.env.example](.env.example) untuk daftar lengkap beserta keterangannya.
Yang wajib: kredensial `AGHRIS_*`, `PORTFOLIO_SUPABASE_*`, `ALLOWED_EMAIL`,
dan `CRON_SECRET`. Sisanya (GitHub, WakaTime, Last.fm) opsional — bila kosong,
bagian terkait di panel login hilang tanpa membuat error.

## Deploy ke Vercel

1. Push repo ini ke GitHub, lalu import di Vercel.
2. Salin semua isi `.env.example` ke **Settings → Environment Variables**.
   Isi `NEXT_PUBLIC_SITE_URL` dengan domain final, mis.
   `https://onward.p441z.my.id`.
3. Jadwal cron sudah diatur lewat [vercel.json](vercel.json). Vercel Cron
   otomatis mengirim `Authorization: Bearer <CRON_SECRET>` selama env-nya
   bernama persis `CRON_SECRET`.

### Sebelum otomasi dinyalakan di Vercel

`src/services/pengaturan.ts` menyimpan preferensi otomasi ke berkas JSON
lokal. **Filesystem Vercel read-only dan ephemeral**, jadi di sana
penyimpanan itu tidak akan bertahan: pengaturan kembali ke bawaan setiap kali
instance baru dijalankan.

Konsekuensinya, di Vercel:

- Halaman **Otomasi** akan gagal saat menyimpan.
- Cron tetap berjalan, tetapi selalu membaca pengaturan bawaan —
  dan bawaannya `auto_aktif: false`, sehingga tidak melakukan apa pun.

Sisa aplikasi (login, dashboard, riwayat, log) berjalan normal. Untuk
mengaktifkan otomasi, pindahkan penyimpanan ke Vercel KV / Upstash / satu
tabel kecil. Kontrak `getPengaturan` / `simpanPengaturan` tidak perlu berubah
— cukup ganti isinya.
