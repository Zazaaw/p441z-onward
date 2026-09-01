-- Tabel penyimpanan Onward, dijalankan di Supabase PORTFOLIO (bukan ESS-DEV).
-- Buka: Supabase Dashboard -> SQL Editor -> tempel -> Run.

-- ── Pengaturan otomasi ────────────────────────────────────────────────────
-- Satu baris saja. `data` berbentuk jsonb supaya menambah pengaturan baru
-- tidak menuntut migrasi kolom.
create table if not exists public.onward_pengaturan (
  id         integer primary key default 1,
  data       jsonb       not null,
  updated_at timestamptz not null default now(),
  -- Pengunci: mustahil ada baris kedua, jadi tidak perlu logika "pilih baris
  -- mana" di aplikasi.
  constraint onward_pengaturan_satu_baris check (id = 1)
);

-- ── Riwayat eksekusi ──────────────────────────────────────────────────────
create table if not exists public.onward_log (
  id     bigserial   primary key,
  waktu  timestamptz not null default now(),
  aksi   text        not null check (aksi in ('checkin', 'checkout')),
  sumber text        not null check (sumber in ('cron', 'manual')),
  ok     boolean     not null,
  pesan  text        not null
);

-- Log selalu dibaca terurut waktu terbaru dan dibatasi 200 baris.
create index if not exists onward_log_waktu_idx
  on public.onward_log (waktu desc);

-- ── Keamanan ──────────────────────────────────────────────────────────────
-- RLS dinyalakan TANPA satu pun policy. Efeknya: anon key sama sekali tidak
-- bisa menyentuh kedua tabel ini, sementara service role key yang dipakai
-- server Onward melewati RLS dan tetap bisa membaca/menulis.
--
-- Ini penting karena anon key portfolio dipakai di tempat lain dan bersifat
-- publik — tanpa RLS, siapa pun yang punya kunci itu bisa mengubah jam
-- presensi otomatismu.
alter table public.onward_pengaturan enable row level security;
alter table public.onward_log        enable row level security;
