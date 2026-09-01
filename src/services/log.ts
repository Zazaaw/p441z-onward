import "server-only";

import { promises as fs } from "fs";
import path from "path";

/**
 * Log eksekusi otomasi.
 *
 * Alasan ada: cron yang diam-diam gagal itu lebih buruk daripada tidak ada
 * cron sama sekali — kamu merasa aman padahal absensimu kosong. Setiap
 * percobaan dicatat di sini, berhasil maupun gagal, supaya dashboard bisa
 * menunjukkan "kapan terakhir jalan" dan "apa hasilnya".
 *
 * Sama seperti pengaturan.ts: file lokal. Kalau nanti deploy ke Vercel,
 * pindahkan ke KV/DB — kontraknya tetap.
 *
 * PENTING: mencatat log TIDAK BOLEH menjatuhkan aksi yang sedang dicatat.
 * Di Vercel filesystem-nya read-only, jadi penulisan di sini pasti gagal
 * dengan EROFS. Sebelum ini galatnya merambat naik ke server action dan
 * memunculkan halaman error, padahal check-in-nya sendiri sudah berhasil
 * masuk database — pengguna melihat "Ada yang tersendat" untuk sesuatu
 * yang sebenarnya sukses.
 */

export type EntriLog = {
  waktu: string; // ISO
  aksi: "checkin" | "checkout";
  sumber: "cron" | "manual";
  ok: boolean;
  pesan: string;
};

const FILE = path.join(process.cwd(), "data", "log.json");
const MAKS = 200; // simpan 200 terakhir saja

export async function bacaLog(): Promise<EntriLog[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf-8"));
  } catch {
    return [];
  }
}

export async function catatLog(entri: Omit<EntriLog, "waktu">): Promise<void> {
  try {
    const log = await bacaLog();
    log.unshift({ waktu: new Date().toISOString(), ...entri });

    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(
      FILE,
      JSON.stringify(log.slice(0, MAKS), null, 2),
      "utf-8"
    );
  } catch (e) {
    // Ditelan dengan sengaja — lihat catatan di atas. Tetap dicetak ke
    // console supaya masih terlihat di log server (Vercel Runtime Logs),
    // jadi kegagalannya tidak benar-benar senyap.
    console.error("[log] gagal menulis riwayat:", e);
  }
}
