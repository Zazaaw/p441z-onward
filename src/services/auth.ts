/**
 * Auth service — SATU-SATUNYA tempat logika autentikasi.
 *
 * ⚠️  BELUM TERSAMBUNG KE BACKEND.
 *     Fungsi di bawah masih stub. Isi implementasinya setelah env + detail
 *     backend tersedia (Supabase / API sendiri / NextAuth — belum diputuskan).
 *
 * Halaman dan komponen TIDAK BOLEH memanggil backend auth langsung — selalu
 * lewat sini. Dengan begitu, ganti provider cukup mengubah satu file.
 */

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
 * Masuk dengan email + kata sandi.
 *
 * IMPLEMENTASI NANTI:
 *  1. Panggil backend (mis. supabase.auth.signInWithPassword).
 *  2. Simpan sesi sebagai cookie httpOnly + secure + sameSite=lax.
 *     JANGAN simpan token di localStorage — bisa dibaca skrip pihak ketiga.
 *  3. Kembalikan { ok: true, user } atau { ok: false, message }.
 *
 * Pesan galat sengaja dibuat samar ("Email atau kata sandi salah") supaya
 * tidak membocorkan email mana yang terdaftar.
 */
export async function signIn(
  _email: string,
  _password: string
): Promise<SignInResult> {
  throw new Error(
    "signIn() belum diimplementasikan. Sambungkan ke backend di src/services/auth.ts"
  );
}

/**
 * Keluar: hapus sesi di server DAN cookie di klien.
 */
export async function signOut(): Promise<void> {
  throw new Error(
    "signOut() belum diimplementasikan. Sambungkan ke backend di src/services/auth.ts"
  );
}

/**
 * Baca sesi aktif di SERVER (server component / middleware / route handler).
 *
 * PENTING: harus benar-benar memverifikasi token ke backend, bukan sekadar
 * mengecek cookie ada atau tidak — cookie bisa dipalsukan. Middleware
 * bergantung pada fungsi ini untuk memblokir akses.
 *
 * Kembalikan null bila tidak ada sesi valid.
 */
export async function getSession(): Promise<SessionUser | null> {
  return null;
}
