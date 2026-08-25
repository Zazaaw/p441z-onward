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
    // 40/60 — panel foto dapat porsi lebih besar; dialah yang membawa warna
    // dan gerak. Sisi kiri kini satu kolom terpusat selebar 22rem, jadi
    // lebar sisanya memang tidak dibutuhkan isinya.
    <div className="grid min-h-dvh w-full grid-cols-1 lg:grid-cols-[2fr_3fr]">
      {/* ── KIRI ─────────────────────────────────────────────────────────
          Satu kolom sempit, rata tengah, semuanya menumpuk rapat:
          merek -> tagline -> kutipan -> form -> catatan kaki.

          Susunan dua kolom sebelumnya membuat tagline dan form saling
          menjauh, dengan lubang besar di atas dan bawahnya. Di sini semua
          elemen berbagi satu sumbu tengah dan jarak antar elemen dijaga
          kecil, sehingga blok ini terbaca sebagai SATU kesatuan padat —
          ruang kosong dibiarkan mengelilinginya, bukan menembusnya. */}
      <div className="relative flex min-h-dvh items-center justify-center px-6 py-10 sm:px-10">
        <DotPattern
          width={22}
          height={22}
          cx={1}
          cy={1}
          cr={1}
          className="pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(65%_55%_at_50%_45%,white,transparent)]"
        />

        <BlurFade className="w-full max-w-[22rem] text-center">
          {/* Merek */}
          <div className="flex items-center justify-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            <LogoOnward className="text-lg" />
          </div>

          {/* Tagline. Ukurannya ditahan jauh lebih kecil dari sebelumnya:
              dalam kolom selebar ini, huruf raksasa akan pecah jadi banyak
              baris dan justru merusak kepadatan blok. */}
          <h1 className="mt-7 text-[clamp(2.5rem,4vw,3.25rem)]">
            <LogoOnwardPanjang className="text-center" />
          </h1>

          {/* Kutipan menggantikan peran deskripsi — dibiarkan tanpa garis
              tepi supaya tetap rata tengah bersama yang lain. */}
          <KutipanHarian className="mx-auto mt-4 max-w-[19rem] text-sm leading-relaxed text-muted-foreground" />

          {/* Form. Label dilepas: dengan susunan setegak ini, urutannya
              sudah menjelaskan dirinya sendiri. */}
          <div className="mt-9 text-left">
            {/* LoginForm membaca ?next= lewat useSearchParams, jadi butuh
                Suspense boundary agar tetap bisa di-prerender. */}
            <Suspense fallback={<FormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Catatan kaki ikut masuk ke dalam blok, tidak lagi dipatok di
              dasar layar — supaya tidak ada elemen yang terpisah jauh. */}
          <div className="mt-8 border-t border-neutral-200 pt-5 dark:border-neutral-800">
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0" />
              Akun dikelola terpusat lewat portfolio.
            </p>
            <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {namaHariWIB()}, {tanggalPanjangWIB()} · WIB
            </p>
          </div>
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
