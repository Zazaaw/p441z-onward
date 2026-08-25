import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import BlurFade from "@/components/effects/blur-fade";
import DotPattern from "@/components/effects/dot-pattern";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoOnward, LogoOnwardPanjang } from "@/components/logo-onward";
import { KutipanHarian } from "./kutipan";
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
    // 40/60 — panel foto di kanan sengaja dapat porsi lebih besar; dialah
    // yang membawa warna dan gerak, jadi lebih pantas mendominasi daripada
    // sisi form. Sisi kiri masih cukup untuk dua kolomnya, hanya saja kedua
    // kolom itu runtuh jadi satu tumpukan lebih awal (di bawah xl).
    <div className="grid min-h-dvh w-full grid-cols-1 lg:grid-cols-[2fr_3fr]">
      {/* ── KIRI ─────────────────────────────────────────────────────────
          Isinya dibagi DUA KOLOM di dalam sisi ini sendiri: tagline besar
          di kolom kiri, form di kolom kanan, keduanya rata tengah secara
          vertikal.

          Susunan sebelumnya menumpuk semuanya dalam satu kolom sempit —
          tagline 6,5rem lalu form 380px tepat di bawahnya — sehingga ada
          tebing lebar antara keduanya dan sisi kanan menganga kosong.
          Dengan dua kolom, ruang itu terpakai oleh form, bukan dibiarkan
          menganga, dan tagline tidak perlu lagi ditarik sebesar mungkin
          demi menutupi kekosongan. */}
      <div className="relative flex min-h-dvh flex-col px-6 py-8 sm:px-10 lg:px-12 xl:px-16">
        <DotPattern
          width={22}
          height={22}
          cx={1}
          cy={1}
          cr={1}
          className="pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(75%_65%_at_15%_20%,white,transparent)]"
        />

        {/* ── Atas: merek + tanggal ─────────────────────────────────────── */}
        <BlurFade className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            <LogoOnward className="text-lg" />
          </div>

          <span className="hidden text-sm text-muted-foreground lg:inline">
            {namaHariWIB()}, {tanggalPanjangWIB()}
          </span>

          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="min-w-0 text-right">
              <p className="truncate text-xs font-semibold leading-tight">
                {nama}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Fullstack Developer &amp; Designer
              </p>
            </div>
            <div className="relative size-8 shrink-0 overflow-hidden rounded-full ring-1 ring-neutral-200 dark:ring-neutral-800">
              {profil?.foto ? (
                <Image
                  src={profil.foto}
                  alt={nama}
                  fill
                  sizes="32px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-muted text-[10px] font-bold">
                  FH
                </span>
              )}
            </div>
          </div>
        </BlurFade>

        {/* ── Tengah: dua kolom berdampingan ─────────────────────────────
            flex-1 membuat blok ini melahap sisa tinggi, lalu isinya
            dipusatkan — jadi jaraknya ke merek di atas dan catatan kaki di
            bawah seimbang dengan sendirinya. */}
        <div className="flex flex-1 items-center py-10">
          <div className="grid w-full gap-y-10 2xl:grid-cols-[1fr_auto] 2xl:gap-x-14">
            {/* Kolom kiri: tagline + kutipan */}
            <BlurFade delay={0.08} className="self-center">
              <h1 className="text-[clamp(2.75rem,7.5vw,5rem)]">
                <LogoOnwardPanjang />
              </h1>

              <KutipanHarian className="mt-7 max-w-sm border-l-2 border-neutral-300 pl-4 text-muted-foreground dark:border-neutral-700" />
            </BlurFade>

            {/* Kolom kanan: form.
                Dengan sisi kiri hanya 40% lebar layar, dua kolom baru muat
                di 2xl ke atas; di bawah itu keduanya menumpuk. */}
            <BlurFade
              delay={0.16}
              className="w-full max-w-sm self-center 2xl:w-[21rem]"
            >
              {/* Pembatas tegak hanya muncul saat benar-benar dua kolom,
                  sebagai pemisah antara sisi merek dan sisi kerja. */}
              <div className="2xl:border-l 2xl:border-neutral-200 2xl:pl-14 dark:2xl:border-neutral-800">
                <p className="mb-6 text-sm font-medium">Masuk ke akunmu</p>

                {/* LoginForm membaca ?next= lewat useSearchParams, jadi
                    butuh Suspense boundary agar tetap bisa di-prerender. */}
                <Suspense fallback={<FormSkeleton />}>
                  <LoginForm />
                </Suspense>
              </div>
            </BlurFade>
          </div>
        </div>

        {/* ── Bawah: catatan kaki ───────────────────────────────────────── */}
        <BlurFade
          delay={0.24}
          className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 shrink-0" />
            Akun dikelola terpusat lewat portfolio.
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            Jakarta · WIB
          </span>
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
