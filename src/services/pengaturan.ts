import "server-only";

import { promises as fs } from "fs";
import path from "path";

/**
 * Pengaturan otomasi.
 *
 * KENAPA FILE, BUKAN DATABASE?
 * Ini alat satu-pengguna. Bikin tabel di ESS-DEV cuma untuk menyimpan
 * preferensi pribadi berarti menitipkan sampah ke database kantor. File JSON
 * lokal lebih tepat, lebih gampang di-backup, dan gampang dihapus.
 *
 * CATATAN DEPLOY: filesystem Vercel bersifat read-only dan ephemeral. Kalau
 * nanti di-deploy ke sana, pindahkan penyimpanan ini ke Vercel KV / Upstash /
 * satu tabel kecil. Kontrak fungsinya (getPengaturan/simpanPengaturan) tidak
 * perlu berubah — cukup ganti isinya.
 */

export type Pengaturan = {
  /** Saklar utama. Kalau false, cron tidak melakukan apa pun. */
  auto_aktif: boolean;

  /** Saklar terpisah, supaya bisa auto-checkout saja tanpa auto-checkin. */
  auto_checkin: boolean;
  auto_checkout: boolean;

  /** Rentang jam acak, format "HH:MM" (WIB). */
  checkin_mulai: string;
  checkin_selesai: string;
  checkout_mulai: string;
  checkout_selesai: string;

  /** Lewati Sabtu–Minggu. */
  lewati_akhir_pekan: boolean;
  /** Lewati tanggal yang ada di tabel hari_libur. */
  lewati_hari_libur: boolean;

  /** Koordinat yang dicatat. Default = titik kantor dari riwayatmu. */
  lat: number;
  lng: number;

  /** Kolom pelengkap agar barisnya konsisten dengan absensi manual. */
  jenis: string;
  shift: string;
  mood_masuk: string;
  mood_keluar: string;
};

/**
 * Default diambil dari pola absensimu yang sudah ada, bukan angka karangan:
 * koordinat -6.2288/106.8335 muncul konsisten, jenis 'wfo', shift 'normal',
 * mood 'bahagia'.
 */
export const DEFAULT_PENGATURAN: Pengaturan = {
  auto_aktif: false, // sengaja MATI di awal — nyalakan sendiri kalau siap
  auto_checkin: true,
  auto_checkout: true,

  checkin_mulai: "07:30",
  checkin_selesai: "07:45",
  checkout_mulai: "22:00",
  checkout_selesai: "22:30",

  lewati_akhir_pekan: true,
  lewati_hari_libur: true,

  lat: -6.2288,
  lng: 106.8335,

  jenis: "wfo",
  shift: "normal",
  mood_masuk: "bahagia",
  mood_keluar: "bahagia",
};

const FILE = path.join(process.cwd(), "data", "pengaturan.json");

export async function getPengaturan(): Promise<Pengaturan> {
  try {
    const isi = await fs.readFile(FILE, "utf-8");
    // Gabung dengan default supaya field baru tidak bikin undefined saat
    // file lama dibaca versi kode yang lebih baru.
    return { ...DEFAULT_PENGATURAN, ...JSON.parse(isi) };
  } catch {
    return DEFAULT_PENGATURAN;
  }
}

export async function simpanPengaturan(
  patch: Partial<Pengaturan>
): Promise<Pengaturan> {
  const sekarang = await getPengaturan();
  const baru = { ...sekarang, ...patch };

  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(baru, null, 2), "utf-8");

  return baru;
}
