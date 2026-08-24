import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Autentikasi lewat Supabase PORTFOLIO (p441z.my.id), bukan AGHRIS.
 *
 * KENAPA DIPISAH?
 * Dashboard ini menulis presensi ke AGHRIS, tapi identitas yang login
 * diverifikasi ke portfolio. Dua sistem berbeda dengan peran berbeda:
 *   - Portfolio → "kamu siapa" (email + password)
 *   - AGHRIS    → "presensi milik NIK berapa" (dari env, bukan dari login)
 *
 * Pemisahan ini disengaja: siapa pun yang lolos login tetap hanya bisa
 * menyentuh satu NIK, yaitu yang tertulis di AGHRIS_NIK.
 *
 * Memakai ANON key, bukan service role — verifikasi password memang harus
 * lewat jalur publik Supabase Auth, dan anon key tidak memberi akses baca
 * apa pun di luar itu.
 */

const url = process.env.PORTFOLIO_SUPABASE_URL;
const anonKey = process.env.PORTFOLIO_SUPABASE_ANON_KEY;

/**
 * Email yang BOLEH masuk. Ini alat pribadi — satu orang saja.
 *
 * Portfolio bisa punya banyak akun terdaftar (siapa pun bisa daftar di sana),
 * jadi lolos autentikasi TIDAK cukup. Harus juga cocok dengan daftar ini.
 * Tanpa lapis kedua ini, siapa pun yang punya akun portfolio bisa masuk dan
 * menulis presensi atas namamu.
 */
const EMAIL_DIIZINKAN = (process.env.ALLOWED_EMAIL ?? "faizandhilmi@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export type HasilAuth =
  | { ok: true; email: string; nama: string; foto: string | null }
  | { ok: false; pesan: string };

export function authSiap(): boolean {
  return Boolean(url && anonKey);
}

/**
 * Verifikasi email + password ke Supabase portfolio.
 *
 * Alurnya:
 *   1. Cek email ada di daftar izin  → kalau tidak, tolak TANPA menembak
 *      Supabase sama sekali (hemat, dan tidak memberi sinyal apa pun ke
 *      penyerang tentang akun mana yang valid).
 *   2. signInWithPassword ke portfolio.
 *   3. Ambil nama & foto dari metadata akun, kalau ada.
 */
export async function masukPortfolio(
  email: string,
  password: string
): Promise<HasilAuth> {
  if (!url || !anonKey) {
    return {
      ok: false,
      pesan:
        "Auth belum dikonfigurasi. Isi PORTFOLIO_SUPABASE_URL dan PORTFOLIO_SUPABASE_ANON_KEY.",
    };
  }

  const bersih = email.trim().toLowerCase();

  // Pesan penolakan sengaja SAMA dengan pesan password salah — supaya tidak
  // bisa dipakai menebak email mana yang terdaftar.
  const DITOLAK = "Email atau kata sandi salah.";

  if (!EMAIL_DIIZINKAN.includes(bersih)) {
    return { ok: false, pesan: DITOLAK };
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: bersih,
    password,
  });

  if (error || !data.user) {
    return { ok: false, pesan: DITOLAK };
  }

  const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;

  return {
    ok: true,
    email: data.user.email ?? bersih,
    nama:
      (meta.full_name as string) ??
      (meta.name as string) ??
      "Faiz Hazim Hawari",
    foto:
      (meta.avatar_url as string) ??
      (meta.picture as string) ??
      null,
  };
}
