import type { Metadata } from "next";
import { Suspense } from "react";
import BlurFade from "@/components/effects/blur-fade";
import DotPattern from "@/components/effects/dot-pattern";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoOnward, LogoOnwardPanjang } from "@/components/logo-onward";
import { KutipanHarian } from "./kutipan";
import { LoginForm } from "./login-form";
import { Showcase } from "./showcase";
import { ShieldCheck } from "lucide-react";
import { profilSaya } from "@/services/presensi";
import {
  getFotoShowcase,
  getKontribusiGithub,
  getNowPlaying,
  getWakatime,
} from "@/services/portfolio";
import { jamWIB, namaHariWIB, tanggalPanjangWIB } from "@/services/waktu";

export const metadata: Metadata = {
  title: "Masuk",
  // Halaman ini memuat identitas personal; tetap jangan diindeks.
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Semua sumber ditembak berbarengan, dan tiap fungsi sudah menelan
  // kegagalannya sendiri (mengembalikan null), jadi halaman ini tidak akan
  // gagal render walau semua API mati.
  const [profil, github, waka, lagu, fotoShowcase] = await Promise.all([
    profilSaya().catch(() => null),
    getKontribusiGithub(),
    getWakatime(),
    getNowPlaying(),
    getFotoShowcase(),
  ]);

  const nama = profil?.nama ?? "Faiz Hazim Hawari";

  return (
    // 40/60 — panel foto di kanan dapat porsi lebih besar; dialah yang
    // membawa warna dan gerak. Sisi kiri isinya sedikit dan dibatasi
    // max-w-[23rem], jadi lebar berlebih memang tidak dibutuhkannya.
    <div className="grid min-h-dvh w-full grid-cols-1 lg:grid-cols-[2fr_3fr]">
      {/* ── KIRI ─────────────────────────────────────────────────────────
          Ditulis ulang dari nol. Aturannya satu: TIDAK MENGULANG apa pun
          yang sudah ada di panel kanan.

          Panel kanan sudah memuat nama, jabatan, jam, tanggal, kontribusi,
          heatmap, jam ngoding, dan lagu. Versi sebelumnya menaruh
          kontribusi + heatmap + jam ngoding lagi di kartu kecil sini —
          angka yang sama persis tampil dua kali di satu layar.

          Maka sisi ini hanya berisi tiga hal, tidak lebih: merek, tagline,
          dan form. Itu memang sedikit, dan justru itu yang membuatnya
          tenang di sebelah panel kanan yang padat. */}
      <div className="relative flex min-h-dvh items-center justify-center p-6 sm:p-10">
        <DotPattern
          width={24}
          height={24}
          cx={1}
          cy={1}
          cr={1}
          className="pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(60%_50%_at_50%_50%,white,transparent)]"
        />

        <BlurFade className="w-full max-w-[23rem]">
          {/* Merek — kecil, di atas, rata kiri seperti seluruh blok ini.
              Sengaja tidak dipusatkan: satu sumbu rata kiri membuat merek,
              tagline, label, dan input berbaris pada satu garis tegak, dan
              garis itulah yang merapikan blok tanpa perlu bingkai kartu. */}
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <LogoOnward className="text-base" />
          </div>

          {/* Tagline — satu-satunya elemen besar di sisi ini. Ukurannya
              dipatok pada lebar kolom (bukan vw) supaya "one day" tetap
              muat dalam satu baris di lebar berapa pun. */}
          <h1 className="mt-12 text-[clamp(3.25rem,4.5vw,4.25rem)]">
            <LogoOnwardPanjang />
          </h1>

          {/* Kutipan sebagai penutup tagline, bukan deskripsi terpisah —
              karena itu jaraknya rapat (mt-5) dan ukurannya kecil. */}
          <KutipanHarian className="mt-6 max-w-[21rem] text-[0.9375rem] leading-relaxed text-muted-foreground" />

          {/* Form. Jaraknya ke tagline dibuat lega (mt-12) supaya dua
              kelompok ini terbaca terpisah: yang di atas identitas, yang
              di bawah pekerjaan. */}
          <div className="mt-12">
            {/* LoginForm membaca ?next= lewat useSearchParams, jadi butuh
                Suspense boundary agar tetap bisa di-prerender. */}
            <Suspense fallback={<FormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0" />
            Akun dikelola terpusat lewat portfolio.
          </p>

          {/* Identitas hanya untuk mobile: di desktop panel kanan sudah
              memuatnya, dan menampilkannya di kedua tempat akan mengulang
              hal yang sama — persis masalah yang membuat susunan lama
              terasa dobel. */}
          <p className="mt-2 text-xs text-muted-foreground lg:hidden">
            {nama} · {namaHariWIB()}, {tanggalPanjangWIB()}
          </p>
        </BlurFade>
      </div>

      {/* ── KANAN: panel bermerek (desktop saja, rounded dengan margin) ── */}
      <div className="hidden p-4 lg:block">
        <Showcase
          foto={profil?.foto}
          nama={nama}
          jamAwal={jamWIB()}
          hari={namaHariWIB()}
          tanggal={tanggalPanjangWIB()}
          fotoShowcase={fotoShowcase}
          github={github}
          waka={waka}
          lagu={lagu}
        />
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-14" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}
