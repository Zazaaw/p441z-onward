import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import BlurFade from "@/components/effects/blur-fade";
import { ShinyText } from "@/components/effects/shiny-text";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";
import { Showcase } from "./showcase";
import { MapPin, ShieldCheck } from "lucide-react";
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
    <div className="grid min-h-dvh w-full grid-cols-1 lg:grid-cols-2">
      {/* ── KIRI: form ───────────────────────────────────────────────────
          Form yang duluan dibaca, bukan panel bermerek — sama seperti
          halaman auth di portfolio. */}
      <BlurFade className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Identitas ringkas. Di desktop panel kanan sudah memuatnya,
              jadi ini hanya tampil saat panel disembunyikan. */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-neutral-200 dark:ring-neutral-800">
              {profil?.foto ? (
                <Image
                  src={profil.foto}
                  alt={nama}
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-muted text-xs font-bold">
                  FH
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">
                {nama}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Fullstack Developer &amp; Designer
              </p>
            </div>
          </div>

          {/* Nama produk — penanda merek di atas judul, bukan kalimat.
              Titik hijau berdenyut menandakan layanan hidup. */}
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-semibold tracking-tight">Daily</span>
            <span className="text-sm text-muted-foreground">
              · {namaHariWIB()}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight">
            <ShinyText>Halo lagi</ShinyText>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Masuk untuk mencatat kehadiran dan melihat rekapmu.
          </p>

          <div className="mt-6">
            {/* LoginForm membaca ?next= lewat useSearchParams, jadi butuh
                Suspense boundary agar halaman tetap bisa di-prerender. */}
            <Suspense fallback={<FormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Penutup: dua keterangan yang benar-benar berguna sebelum
              login — tanggal berlaku, dan dari mana akunnya berasal. */}
          <div className="mt-8 space-y-2 border-t border-neutral-200 pt-5 text-xs text-muted-foreground dark:border-neutral-800">
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              {tanggalPanjangWIB()} · zona WIB
            </p>
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 shrink-0" />
              Akun dikelola terpusat lewat portfolio.
            </p>
          </div>
        </div>
      </BlurFade>

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
