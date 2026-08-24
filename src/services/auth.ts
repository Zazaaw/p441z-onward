/**
 * Pembacaan sesi di sisi server.
 *
 * Identitas diverifikasi ke Supabase PORTFOLIO (lihat portfolio-auth.ts),
 * sementara data presensi selalu terikat ke AGHRIS_NIK dari env. Login
 * menjawab "boleh masuk atau tidak" — bukan "presensi siapa".
 */

import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "./sesi";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff";
  foto?: string | null;
};

/**
 * Sesi aktif, atau null.
 *
 * ⚠️  Ini men-DECODE cookie, belum MEMVERIFIKASI tanda tangan — lihat
 *     catatan di sesi.ts. Cukup untuk pemakaian lokal, belum untuk publik.
 */
export async function getSession(): Promise<SessionUser | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}
