"use server";

import { cookies } from "next/headers";
import type { SessionUser } from "./auth";
import { SESSION_COOKIE, encodeSession } from "./sesi";
import { masukPortfolio } from "./portfolio-auth";

/* ==========================================================================
 *  Server actions untuk auth.
 *
 *  Kenapa server action, bukan set cookie dari client?
 *  Karena cookie sesi harus httpOnly — supaya tidak bisa dibaca JavaScript
 *  (perlindungan dasar terhadap XSS). Cookie httpOnly HANYA bisa di-set dari
 *  server.
 *
 *  Identitas diverifikasi ke Supabase PORTFOLIO. NIK yang dipakai untuk
 *  presensi TIDAK diambil dari hasil login — melainkan dari env AGHRIS_NIK.
 *  Jadi login hanya menjawab "boleh masuk atau tidak", bukan "presensi siapa".
 * ========================================================================== */

export type SignInActionResult =
  | { ok: true; user: SessionUser }
  | { ok: false; message: string };

export async function signInAction(
  email: string,
  password: string
): Promise<SignInActionResult> {
  const hasil = await masukPortfolio(email, password);

  if (!hasil.ok) {
    return { ok: false, message: hasil.pesan };
  }

  const user: SessionUser = {
    id: hasil.email,
    email: hasil.email,
    name: hasil.nama,
    role: "admin",
    foto: hasil.foto,
  };

  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 jam — sesi kerja, bukan "ingat saya"
  });

  return { ok: true, user };
}

export async function signOutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
