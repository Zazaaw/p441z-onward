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
3. Cron **tidak** memakai Vercel Cron: paket Hobby hanya mengizinkan satu
   eksekusi per hari, sedangkan presensi butuh dua (check-in pagi dan
   check-out malam). Penjadwalannya lewat GitHub Actions — lihat di bawah.

## Cron lewat GitHub Actions

[.github/workflows/cron.yml](.github/workflows/cron.yml) memanggil
`/api/cron` dua kali pada hari kerja: 07:25 dan 21:55 WIB, beberapa menit
sebelum masing-masing jendela dibuka.

Isi dua secret di **Settings → Secrets and variables → Actions**:

| Secret | Isi |
| --- | --- |
| `SITE_URL` | `https://onward.p441z.my.id` (tanpa garis miring di akhir) |
| `CRON_SECRET` | nilai yang sama dengan env di Vercel |

Untuk menguji tanpa benar-benar presensi: tab **Actions** → *Presensi
otomatis* → **Run workflow**, centang *Uji coba*.

Catatan: jadwal Actions kerap meleset 5–15 menit saat antreannya ramai.
Endpoint sudah memberi toleransi 2 jam setelah jendela berakhir, jadi
keterlambatan sebesar itu masih tertangani.

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
