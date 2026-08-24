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

/** Prefix yang dilewati sepenuhnya (aset & internal Next.js). */
const BYPASS_PREFIXES = ["/_next", "/favicon.ico", "/icon", "/apple-icon"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  // ⚠️  SEMENTARA: baru mengecek KEBERADAAN cookie, belum memvalidasi isinya.
  //
  //     Ini BELUM aman — siapa pun bisa membuat cookie bernama "session"
  //     lewat devtools dan lolos. Sebelum dipakai sungguhan, ganti dengan
  //     verifikasi token ke backend (getSession() di src/services/auth.ts).
  //
  //     Catatan: middleware berjalan di Edge runtime, jadi library yang
  //     butuh Node API tidak bisa dipakai di sini. Kalau verifikasinya berat,
  //     pindahkan ke layout server component dan sisakan middleware untuk
  //     pengalihan kasar saja.
  const hasSession = Boolean(req.cookies.get("session")?.value);

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
