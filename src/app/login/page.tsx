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
    <div className="grid min-h-dvh w-full grid-cols-1 lg:grid-cols-2">
      {/* ── KIRI: form ───────────────────────────────────────────────────
          Tiga zona yang mengisi TINGGI PENUH, bukan kartu mengambang di
          tengah. Sebelumnya sisi ini cuma kotak kecil di lautan kosong,
          sementara panel kanan penuh warna dan gerak — timpang.

          Sekarang: merek dipatok di atas, blok utama (tagline + form) di
          tengah, catatan kaki di dasar. Ruang kosongnya jadi jarak antar
          zona, bukan lubang di sekeliling satu kotak. */}
      <div className="relative flex min-h-dvh flex-col justify-between px-6 py-8 sm:px-12 lg:px-16 xl:px-20">
        {/* Tekstur halus supaya sisi ini tidak terasa hampa di sebelah panel
            kanan yang penuh gambar. Di-mask memudar ke bawah agar tidak
            mengganggu keterbacaan form. */}
        <DotPattern
          width={22}
          height={22}
          cx={1}
          cy={1}
          cr={1}
          className="pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(70%_60%_at_20%_25%,white,transparent)]"
        />

        {/* ── Zona atas: merek ──────────────────────────────────────────── */}
        <BlurFade className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            <LogoOnward className="text-lg" />
          </div>

          {/* Tanggal di sudut kanan — mengisi sudut yang tadinya kosong dan
              memberi zona atas dua titik berat, bukan cuma satu di kiri.
              Hanya di desktop; di mobile tempatnya dipakai identitas. */}
          <span className="hidden text-sm text-muted-foreground lg:inline">
            {namaHariWIB()}, {tanggalPanjangWIB()}
          </span>

          {/* Identitas dipindah ke sini — di desktop panel kanan sudah
              memuatnya, jadi cukup tampil saat panel disembunyikan. */}
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

        {/* ── Zona tengah: tagline + form ───────────────────────────────
            Dibatasi max-w-sm dan dibiarkan rata kiri, jadi tepi kiri
            tagline, label, dan tombol semuanya berbaris pada satu garis
            tegak — itu yang membuat blok ini terbaca rapi tanpa perlu
            bingkai kartu. */}
        <BlurFade delay={0.08} className="w-full py-12">
          {/* Tagline dibiarkan melebar mengikuti sisi kiri, tidak dikurung
              max-w-sm seperti form. Inilah yang mengisi ruang kosong: huruf,
              bukan elemen tambahan. 8vw membuatnya ikut tumbuh di layar
              lebar, dan clamp menahannya agar tidak meluber di layar kecil. */}
          <h1 className="text-[clamp(3.25rem,8vw,6.5rem)]">
            <LogoOnwardPanjang />
          </h1>

          {/* Kutipan harian, bukan jam: panel kanan sudah memuat jam raksasa,
              dan dua jam identik berdampingan membuat yang di sisi ini
              terlihat tanpa alasan. Kutipan memberi sisi kiri isi yang tidak
              dipunyai panel kanan.

              Dipisah garis tipis di kiri supaya terbaca sebagai kutipan,
              bukan subjudul lanjutan dari tagline. */}
          <KutipanHarian className="mt-8 max-w-md border-l-2 border-neutral-300 pl-4 text-muted-foreground dark:border-neutral-700" />

          {/* Form tetap dikurung sempit: baris input yang terlalu lebar
              justru sulit dipindai, dan tepi kirinya tetap sejajar dengan
              tagline di atasnya. */}
          <div className="mt-10 w-full max-w-sm">
            {/* LoginForm membaca ?next= lewat useSearchParams, jadi butuh
                Suspense boundary agar halaman tetap bisa di-prerender. */}
            <Suspense fallback={<FormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>
        </BlurFade>

        {/* ── Zona bawah: catatan kaki ──────────────────────────────────── */}
        <BlurFade
          delay={0.16}
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
