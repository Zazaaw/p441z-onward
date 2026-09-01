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

### Menyiapkan penyimpanan (wajib, sekali saja)

Pengaturan otomasi dan riwayat cron disimpan di Supabase **portfolio**, bukan
ESS-DEV — preferensi pribadi tidak dititipkan ke database kantor.

1. Buka Supabase Dashboard project portfolio → **SQL Editor**, jalankan
   [sql/001-penyimpanan-onward.sql](sql/001-penyimpanan-onward.sql).
2. **Project Settings → API**, salin `service_role` key.
3. Isi `PORTFOLIO_SUPABASE_SERVICE_ROLE_KEY` — di `.env.local` untuk lokal,
   dan di Environment Variables Vercel untuk produksi.

Tanpa langkah ini aplikasi tetap jalan, tetapi otomasi tidak bisa dinyalakan
dan halaman Log kosong.

### Kenapa tidak berupa berkas JSON lagi

Sebelumnya keduanya disimpan di `data/*.json`. Itu jalan mulus di laptop dan
gagal total di Vercel yang filesystem-nya read-only, dengan dua akibat yang
sulit dilacak:

- Menekan check-in memunculkan halaman error padahal barisnya sudah masuk
  database — yang gagal cuma pencatatan log setelahnya.
- Cron tampak sehat (Actions hijau, HTTP 200) tetapi tidak pernah melakukan
  apa pun, karena pengaturan selalu jatuh ke bawaan `auto_aktif: false`.

Menyamakan penyimpanan dev dan produksi menghapus seluruh kelas kegagalan itu.
