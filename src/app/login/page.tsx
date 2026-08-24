import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import BlurFade from "@/components/effects/blur-fade";
import { ShinyText } from "@/components/effects/shiny-text";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";
import { Showcase } from "./showcase";
import { profilSaya } from "@/services/presensi";
import {
  getFotoShowcase,
  getKontribusiGithub,
  getNowPlaying,
  getWakatime,
} from "@/services/portfolio";
import { jamWIB, namaHariWIB, tanggalWIB } from "@/services/waktu";

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
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="relative size-7 shrink-0 overflow-hidden rounded-full ring-1 ring-neutral-200 dark:ring-neutral-800">
              {profil?.foto ? (
                <Image
                  src={profil.foto}
                  alt={nama}
                  fill
                  sizes="28px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-muted text-[10px] font-bold">
                  FH
                </span>
              )}
            </div>
            <span className="text-base font-semibold">Dashboard Absensi</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            <ShinyText>Halo lagi</ShinyText>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masuk untuk melanjutkan ke dashboard.
          </p>

          <div className="mt-6">
            {/* LoginForm membaca ?next= lewat useSearchParams, jadi butuh
                Suspense boundary agar halaman tetap bisa di-prerender. */}
            <Suspense fallback={<FormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Akun dikelola terpusat. Hubungi admin bila lupa kata sandi.
          </p>
        </div>
      </BlurFade>

      {/* ── KANAN: panel bermerek (desktop saja, rounded dengan margin) ── */}
      <div className="hidden p-4 lg:block">
        <Showcase
          foto={profil?.foto}
          nama={nama}
          jamAwal={jamWIB()}
          hari={namaHariWIB()}
          tanggal={tanggalWIB()}
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
