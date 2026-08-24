/* ==========================================================================
 *  ⚠️  DUMMY AUTH — SEMENTARA, UNTUK MENCOBA ALUR SAJA
 * --------------------------------------------------------------------------
 *  File ini HANYA ada supaya alur login → dashboard → logout bisa dilihat
 *  sebelum backend asli tersedia.
 *
 *  TIDAK AMAN. Jangan pernah dipakai di produksi:
 *    - Kredensial ada di kode (bisa dibaca siapa pun yang buka repo)
 *    - Password dibandingkan apa adanya, tanpa hashing
 *    - Cookie sesi cuma penanda, tidak ditandatangani → bisa dipalsukan
 *      lewat devtools
 *
 *  CARA MENGHAPUS nanti (3 langkah):
 *    1. Hapus file ini
 *    2. Di src/services/auth.ts, buang blok "DUMMY" dan isi implementasi asli
 *    3. Di src/proxy.ts, ganti pengecekan cookie dengan verifikasi token
 * ========================================================================== */

import type { SessionUser } from "./auth";

/** Nama cookie sesi. Dipakai bareng oleh auth.ts dan proxy.ts. */
export const SESSION_COOKIE = "session";

/** Akun percobaan. Hapus seluruh blok ini saat backend asli masuk. */
const DUMMY_ACCOUNTS: Array<{
  email: string;
  password: string;
  user: SessionUser;
}> = [
  {
    email: "admin@absensi.test",
    password: "admin123",
    user: {
      id: "dummy-admin",
      email: "admin@absensi.test",
      name: "Admin Percobaan",
      role: "admin",
    },
  },
  {
    email: "staff@absensi.test",
    password: "staff123",
    user: {
      id: "dummy-staff",
      email: "staff@absensi.test",
      name: "Staff Percobaan",
      role: "staff",
    },
  },
];

/**
 * Cocokkan email + password dengan daftar di atas.
 * Email tidak case-sensitive, seperti perilaku backend pada umumnya.
 */
export function matchDummyAccount(
  email: string,
  password: string
): SessionUser | null {
  const found = DUMMY_ACCOUNTS.find(
    (a) =>
      a.email.toLowerCase() === email.trim().toLowerCase() &&
      a.password === password
  );
  return found ? found.user : null;
}

/**
 * Encode user jadi isi cookie.
 *
 * Base64 BUKAN enkripsi — siapa pun bisa membacanya. Dipakai di sini semata
 * supaya JSON aman masuk header cookie. Yang asli nanti harus token
 * bertanda tangan (JWT) atau session id yang divalidasi ke database.
 */
export function encodeDummySession(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user), "utf-8").toString("base64");
}

/** Kebalikan dari encodeDummySession. Kembalikan null kalau isinya rusak. */
export function decodeDummySession(raw: string): SessionUser | null {
  try {
    const json = Buffer.from(raw, "base64").toString("utf-8");
    const parsed = JSON.parse(json);
    // Cek bentuknya seadanya — cookie bisa saja diedit orang.
    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.email === "string" &&
      (parsed.role === "admin" || parsed.role === "staff")
    ) {
      return parsed as SessionUser;
    }
    return null;
  } catch {
    return null;
  }
}
