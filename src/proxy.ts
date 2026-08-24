import { NextRequest, NextResponse } from "next/server";

/**
* Gerbang autentikasi (Next.js 16: file ini dulu bernama middleware.ts).
 *
 * MODEL YANG DIPAKAI: deny-by-default.
 * Semua rute DIBLOKIR kecuali yang terdaftar di PUBLIC_ROUTES. Ini kebalikan
 * dari pola "blokir /dashboard/*" yang umum — dan lebih aman, karena halaman
 * baru otomatis terlindungi tanpa perlu ingat mendaftarkannya.
 *
 * ⚠️  BELUM SELESAI — lihat catatan di bawah sebelum produksi.
 */

/** Hanya rute ini yang boleh diakses tanpa sesi. */
const PUBLIC_ROUTES = ["/login"];

/** Nama cookie sesi. Harus sama dengan di services/sesi.ts. */
const SESSION_COOKIE = "session";

/**
 * Baca cookie sesi di Edge runtime.
 *
 * Tidak memakai decodeSession() dari services/sesi.ts karena fungsi itu pakai
 * `Buffer`, yang tidak tersedia di Edge. Di sini pakai atob() bawaan Web API.
 *
 * Mengembalikan true bila isinya berbentuk sesi yang masuk akal.
 */
function readSession(raw: string | undefined): boolean {
  if (!raw) return false;
  try {
    const parsed = JSON.parse(atob(raw));
    return (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.email === "string" &&
      (parsed.role === "admin" || parsed.role === "staff")
    );
  } catch {
    // Bukan base64 valid, atau bukan JSON → anggap tidak ada sesi.
    return false;
  }
}

/**
 * Prefix yang dilewati sepenuhnya.
 *
 * `/api/cron` sengaja dikecualikan: penjadwal eksternal tidak punya cookie
 * sesi, jadi kalau ikut aturan deny-by-default dia akan selamanya kena
 * redirect ke /login. Endpoint itu menjaga dirinya sendiri dengan
 * `Authorization: Bearer <CRON_SECRET>` — dan menolak jalan sama sekali
 * kalau CRON_SECRET belum diset.
 */
const BYPASS_PREFIXES = [
  "/_next",
  "/favicon.ico",
  "/icon",
  "/apple-icon",
  "/api/cron",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  // Cek sesi: isi cookie harus benar-benar bisa dibaca sebagai user, bukan
  // sekadar ada. Cookie karangan seperti `session=asal` akan ditolak.
  //
  // ⚠️  DUMMY: ini decode, BUKAN verifikasi. Cookie-nya tidak ditandatangani,
  //     jadi orang yang tahu formatnya masih bisa membuat sesi palsu.
  //     Yang asli nanti: verifikasi tanda tangan token (JWT) atau cek session
  //     id ke database.
  //
  //     Catatan runtime: proxy berjalan di Edge, jadi library yang butuh Node
  //     API tidak bisa dipakai di sini. Verifikasi berat sebaiknya di layout
  //     server component — lapis kedua sudah terpasang di
  //     src/app/(dashboard)/layout.tsx.
  const hasSession = Boolean(readSession(req.cookies.get(SESSION_COOKIE)?.value));

  if (!hasSession && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // Simpan tujuan awal supaya bisa dikembalikan setelah login.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Sudah login tapi membuka /login → lempar ke dashboard.
  if (hasSession && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Jalankan di SEMUA rute kecuali aset statis.
   * Sengaja luas — konsekuensi dari deny-by-default di atas.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
