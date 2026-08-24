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
  const log = await bacaLog();
  log.unshift({ waktu: new Date().toISOString(), ...entri });

  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(
    FILE,
    JSON.stringify(log.slice(0, MAKS), null, 2),
    "utf-8"
  );
}
