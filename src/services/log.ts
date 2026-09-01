import "server-only";

import { simpanan } from "./simpanan-client";

/**
 * Log eksekusi otomasi.
 *
 * Alasan ada: cron yang diam-diam gagal itu lebih buruk daripada tidak ada
 * cron sama sekali — kamu merasa aman padahal absensimu kosong. Setiap
 * percobaan dicatat di sini, berhasil maupun gagal, supaya dashboard bisa
 * menunjukkan "kapan terakhir jalan" dan "apa hasilnya".
 *
 * Dulu berupa berkas JSON lokal, dan itu justru mematahkan tujuannya sendiri
 * di produksi: filesystem Vercel read-only, jadi tidak ada satu pun eksekusi
 * yang tercatat — persis kondisi "tidak tahu cron jalan atau tidak" yang mau
 * dihindari. Sekarang di Supabase portfolio.
 */

export type EntriLog = {
  waktu: string; // ISO
  aksi: "checkin" | "checkout";
  sumber: "cron" | "manual";
  ok: boolean;
  pesan: string;
};

const TABEL = "onward_log";
const MAKS = 200; // yang ditampilkan, bukan yang disimpan

export async function bacaLog(): Promise<EntriLog[]> {
  if (!simpanan) return [];

  const { data, error } = await simpanan
    .from(TABEL)
    .select("waktu, aksi, sumber, ok, pesan")
    .order("waktu", { ascending: false })
    .limit(MAKS);

  if (error) {
    console.error("[log] gagal membaca:", error.message);
    return [];
  }

  return (data ?? []) as EntriLog[];
}

/**
 * PENTING: mencatat log TIDAK BOLEH menjatuhkan aksi yang sedang dicatat.
 *
 * Ini pernah terjadi: penulisan gagal, galatnya merambat naik ke server
 * action, dan pengguna melihat halaman error untuk check-in yang sebenarnya
 * sudah berhasil masuk database. Galatnya ditelan di sini, tapi tetap
 * dicetak ke console supaya masih terlihat di log server.
 */
export async function catatLog(entri: Omit<EntriLog, "waktu">): Promise<void> {
  if (!simpanan) return;

  try {
    const { error } = await simpanan
      .from(TABEL)
      .insert({ waktu: new Date().toISOString(), ...entri });

    if (error) console.error("[log] gagal menulis riwayat:", error.message);
  } catch (e) {
    console.error("[log] gagal menulis riwayat:", e);
  }
}
