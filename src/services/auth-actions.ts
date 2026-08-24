"use server";

import { cookies } from "next/headers";
import type { SessionUser } from "./auth";
import {
  SESSION_COOKIE,
  matchDummyAccount,
  encodeDummySession,
} from "./auth-dummy";

/* ==========================================================================
 *  Server actions untuk auth.
 *
 *  Kenapa server action, bukan set cookie dari client?
 *  Karena cookie sesi harus httpOnly — supaya tidak bisa dibaca JavaScript
 *  (perlindungan dasar terhadap XSS). Cookie httpOnly HANYA bisa di-set dari
 *  server. Itu sebabnya login memanggil action ini, bukan document.cookie.
 *
 *  ⚠️  Isi fungsinya masih memakai DUMMY. Struktur file ini sudah benar dan
 *      bisa dipertahankan — nanti tinggal ganti bagian dalamnya dengan
 *      panggilan ke backend asli.
 * ========================================================================== */

export type SignInActionResult =
  | { ok: true; user: SessionUser }
  | { ok: false; message: string };

export async function signInAction(
  email: string,
  password: string
): Promise<SignInActionResult> {
  // Jeda kecil supaya loading state terlihat — dummy ini instan, yang asli
  // nanti punya latensi jaringan sendiri. Hapus saat backend masuk.
  await new Promise((r) => setTimeout(r, 400));

  // ── DUMMY: ganti dengan panggilan backend ──
  const user = matchDummyAccount(email, password);
  // ───────────────────────────────────────────

  if (!user) {
    // Pesan sengaja samar — tidak membedakan email salah vs password salah,
    // karena itu membocorkan email mana yang terdaftar.
    return { ok: false, message: "Email atau kata sandi salah." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, encodeDummySession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 jam — sesi kerja, bukan "ingat saya"
  });

  return { ok: true, user };
}

export async function signOutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
