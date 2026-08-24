/**
 * Perkakas waktu.
 *
 * SEMUA logika presensi memakai zona Asia/Jakarta (WIB), bukan waktu server.
 * Vercel berjalan di UTC — kalau tidak dikonversi, "hari ini" versi server
 * bisa berbeda satu hari dari "hari ini" versi kamu, dan itu menghasilkan
 * baris presensi di tanggal yang salah.
 */

export const WIB = "Asia/Jakarta";

/** Tanggal hari ini di WIB, format YYYY-MM-DD (cocok untuk kolom `date`). */
export function tanggalWIB(now = new Date()): string {
  // en-CA memberi format YYYY-MM-DD secara langsung.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Tanggal WIB dalam bentuk yang enak dibaca: "24 Agustus 2026".
 *
 * `tanggalWIB()` sengaja tetap ISO karena dipakai sebagai kunci query ke
 * database; yang ini khusus untuk ditampilkan.
 */
export function tanggalPanjangWIB(now = new Date()): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: WIB,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
}

/** Jam:menit sekarang di WIB, format HH:MM. */
export function jamWIB(now = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: WIB,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

/** Nama hari dalam bahasa Indonesia, mis. "Senin". */
export function namaHariWIB(now = new Date()): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: WIB,
    weekday: "long",
  }).format(now);
}

/** 0 = Minggu … 6 = Sabtu, dihitung di WIB. */
export function hariKeWIB(now = new Date()): number {
  const nama = new Intl.DateTimeFormat("en-US", {
    timeZone: WIB,
    weekday: "short",
  }).format(now);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(nama);
}

/** true untuk Senin–Jumat. Hari libur nasional dicek terpisah. */
export function hariKerja(now = new Date()): boolean {
  const d = hariKeWIB(now);
  return d >= 1 && d <= 5;
}

/** "HH:MM" → menit sejak tengah malam. */
export function keMenit(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Menit sejak tengah malam → "HH:MM". */
export function keJam(menit: number): string {
  const h = Math.floor(menit / 60) % 24;
  const m = menit % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Pilih satu waktu acak dalam rentang [mulai, selesai], inklusif.
 * Presisi sampai detik supaya tidak selalu jatuh di menit bulat —
 * jam yang selalu tepat :00 justru terlihat dibuat mesin.
 *
 * Mengembalikan { jam: "HH:MM", detik: 0-59 }.
 */
export function jamAcak(
  mulai: string,
  selesai: string
): { jam: string; detik: number } {
  const a = keMenit(mulai);
  const b = keMenit(selesai);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const menit = lo + Math.floor(Math.random() * (hi - lo + 1));
  return { jam: keJam(menit), detik: Math.floor(Math.random() * 60) };
}

/**
 * Rakit sebuah timestamp absolut dari tanggal WIB + jam WIB.
 *
 * Kenapa tidak `new Date("2026-08-24T07:40:00+07:00")` langsung? Karena offset
 * WIB tetap +07:00 sepanjang tahun (Indonesia tidak punya DST), jadi cara ini
 * aman DAN eksplisit — pembaca kode langsung tahu zona mana yang dimaksud.
 */
export function timestampWIB(
  tanggal: string,
  jam: string,
  detik = 0
): string {
  const dd = String(detik).padStart(2, "0");
  return new Date(`${tanggal}T${jam}:${dd}+07:00`).toISOString();
}

/** Format enak dibaca: "24 Agu 2026, 07.42". */
export function formatWIB(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: WIB,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Hanya jamnya: "07.42". */
export function formatJamWIB(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: WIB,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
