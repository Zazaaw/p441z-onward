/**
 * Auth service — SATU-SATUNYA tempat logika autentikasi.
 *
 * ⚠️  SAAT INI MEMAKAI DUMMY (lihat auth-dummy.ts).
 *     Alur login/logout/sesi sudah berjalan penuh, tapi kredensialnya
 *     hardcoded dan cookie-nya tidak ditandatangani. Cukup untuk mencoba
 *     alur, TIDAK cukup untuk produksi.
 *
 * Halaman dan komponen TIDAK BOLEH memanggil backend auth langsung — selalu
 * lewat sini. Dengan begitu, ganti provider cukup mengubah satu file.
 */

import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeDummySession } from "./auth-dummy";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  /** Peran menentukan menu apa yang tampil dan aksi apa yang boleh. */
  role: "admin" | "staff";
};

export type SignInResult =
  | { ok: true; user: SessionUser }
  | { ok: false; message: string };

/**
 * Baca sesi aktif di SERVER (server component / route handler).
 *
 * ⚠️  DUMMY: hanya men-decode cookie. Yang asli WAJIB memverifikasi token ke
 *     backend — cookie bisa dipalsukan, jadi decode saja bukan verifikasi.
 *
 * Kembalikan null bila tidak ada sesi valid.
 */
export async function getSession(): Promise<SessionUser | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decodeDummySession(raw);
}

/**
 * Catatan: signIn dan signOut TIDAK ada di sini.
 *
 * Keduanya harus menulis cookie httpOnly, dan itu cuma bisa dari server.
 * Jadi mereka hidup sebagai server action di `auth-actions.ts`:
 *
 *   import { signInAction, signOutAction } from "@/services/auth-actions";
 */
