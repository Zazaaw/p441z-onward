import "server-only";

import { simpanan, PESAN_BELUM_DISETEL } from "./simpanan-client";

/**
 * Pengaturan otomasi.
 *
 * Disimpan di Supabase portfolio, satu baris jsonb.
 *
 * Dulu berupa berkas JSON lokal dengan alasan "jangan menitipkan preferensi
 * pribadi ke database kantor". Alasan itu masih berlaku — makanya yang
 * dipakai database portfolio, bukan ESS-DEV. Yang berubah cuma medianya,
 * karena filesystem Vercel read-only sehingga berkasnya tidak pernah bisa
 * ditulis di produksi.
 *
 * Bentuknya jsonb, bukan satu kolom per field, supaya menambah pengaturan
 * baru tidak menuntut migrasi — persis seperti sebelumnya saat masih JSON.
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

/** Satu baris saja, dikunci pada id = 1. */
const BARIS_ID = 1;
const TABEL = "onward_pengaturan";

export async function getPengaturan(): Promise<Pengaturan> {
  if (!simpanan) {
    console.warn("[pengaturan]", PESAN_BELUM_DISETEL, "— memakai bawaan.");
    return DEFAULT_PENGATURAN;
  }

  const { data, error } = await simpanan
    .from(TABEL)
    .select("data")
    .eq("id", BARIS_ID)
    .maybeSingle();

  // Gagal baca jangan sampai menjatuhkan halaman yang memanggilnya —
  // dashboard tetap harus tampil walau pengaturan tidak terbaca.
  if (error) {
    console.error("[pengaturan] gagal membaca:", error.message);
    return DEFAULT_PENGATURAN;
  }

  // Gabung dengan bawaan supaya field yang baru ditambahkan tidak menjadi
  // undefined saat baris lama dibaca oleh versi kode yang lebih baru.
  return { ...DEFAULT_PENGATURAN, ...((data?.data as Partial<Pengaturan>) ?? {}) };
}

export async function simpanPengaturan(
  patch: Partial<Pengaturan>
): Promise<Pengaturan> {
  // Di sini justru MELEMPAR kalau belum disetel — beda dari pembaca di atas.
  // Menyimpan yang diam-diam gagal jauh lebih berbahaya: pengguna mengira
  // otomasi sudah menyala padahal tidak.
  if (!simpanan) throw new Error(PESAN_BELUM_DISETEL);

  const sekarang = await getPengaturan();
  const baru = { ...sekarang, ...patch };

  const { error } = await simpanan
    .from(TABEL)
    .upsert({ id: BARIS_ID, data: baru, updated_at: new Date().toISOString() });

  if (error) throw new Error(`Gagal menyimpan pengaturan: ${error.message}`);

  return baru;
}
