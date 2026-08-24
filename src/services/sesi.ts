import type { SessionUser } from "./auth";

/**
 * Penyandian cookie sesi.
 *
 * Nama cookie dipakai bersama oleh auth-actions.ts (menulis), auth.ts
 * (membaca di server component), dan proxy.ts (menyaring request).
 */
export const SESSION_COOKIE = "session";

/**
 * Encode user jadi isi cookie.
 *
 * ⚠️  Base64 BUKAN enkripsi dan BUKAN tanda tangan — siapa pun bisa
 *     membacanya, dan orang yang tahu formatnya bisa mengarang cookie yang
 *     lolos. Yang menahan penyalahgunaan saat ini adalah cookie-nya httpOnly
 *     (tidak terbaca skrip) dan aplikasinya hanya berjalan lokal.
 *
 *     Sebelum di-deploy ke internet, ganti dengan JWT bertanda tangan atau
 *     session id yang divalidasi ke database.
 */
export function encodeSession(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user), "utf-8").toString("base64");
}

/** Kebalikan encodeSession. Kembalikan null kalau isinya rusak/dipalsukan. */
export function decodeSession(raw: string): SessionUser | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
    // Periksa bentuknya — cookie bisa saja diedit orang.
    if (
      parsed &&
      typeof parsed.email === "string" &&
      typeof parsed.name === "string"
    ) {
      return parsed as SessionUser;
    }
    return null;
  } catch {
    return null;
  }
}
