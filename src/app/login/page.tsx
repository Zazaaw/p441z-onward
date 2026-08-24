import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Code2, MapPin } from "lucide-react";
import { SiGithub, SiSpotify } from "react-icons/si";
import BlurFade from "@/components/effects/blur-fade";
import DotPattern from "@/components/effects/dot-pattern";
import GridPattern from "@/components/effects/grid-pattern";
import { ShinyText } from "@/components/effects/shiny-text";
import { JamHidup } from "@/components/jam-hidup";
import { KontribusiGrid } from "@/components/kontribusi-grid";
import { NowPlaying } from "@/components/now-playing";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";
import { profilSaya } from "@/services/presensi";
import {
  getKontribusiGithub,
  getWakatime,
  getNowPlaying,
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
  const [profil, github, waka, lagu] = await Promise.all([
    profilSaya().catch(() => null),
    getKontribusiGithub(),
    getWakatime(),
    getNowPlaying(),
  ]);

  return (
    <main className="relative min-h-dvh">
      {/* ── LATAR: dua lapis pola, sama seperti di portfolio ──────────────
          Dot dan grid di-mask ke arah berlawanan (kanan-bawah vs kiri-atas),
          jadi masing-masing memudar ke sudut yang ditempati satunya. Itu
          yang membuatnya terbaca sebagai TEKSTUR, bukan wallpaper. */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
          className="[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
        />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0">
        <GridPattern
          width={50}
          height={50}
          duration={15}
          repeatDelay={1}
          maxOpacity={0.08}
          x={-1}
          y={-1}
          className="[mask-image:linear-gradient(to_top_left,white,transparent,transparent)]"
        />
      </div>

      {/* Konten harus di atas lapisan pola */}
      <div className="relative z-20 grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
        {/* ── KIRI: sisi personal ─────────────────────────────────────────
            Disusun terpusat (justify-center), BUKAN justify-between.
            Sebelumnya isi tersebar ke ujung atas-bawah sehingga jam melayang
            sendirian dengan lubang kosong besar di sekitarnya. Sekarang semua
            elemen berkumpul sebagai satu blok dengan ritme rapat, dan ruang
            kosong dibiarkan di luar blok — itu yang bikin terbaca sengaja. */}
        <section className="relative hidden flex-col justify-center border-r border-neutral-200 p-10 lg:flex xl:p-16 dark:border-neutral-800">
          {/* Identitas — kecil di atas, sebagai pembuka */}
          <BlurFade>
            <div className="flex items-center gap-3">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-full ring-1 ring-neutral-200 dark:ring-neutral-800">
                {profil?.foto ? (
                  <Image
                    src={profil.foto}
                    alt={profil.nama}
                    fill
                    sizes="44px"
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
                  {profil?.nama ?? "Faiz Hazim Hawari"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Fullstack Developer &amp; Designer
                </p>
              </div>
            </div>
          </BlurFade>

          {/* Jam — puncak hierarki. Jaraknya ke identitas sengaja rapat
              (mt-10) supaya keduanya terbaca satu kelompok. */}
          <BlurFade delay={0.08} className="mt-10">
            <p className="text-sm text-muted-foreground">
              {namaHariWIB()}, {tanggalWIB()}
            </p>
            <p className="mt-2 text-[clamp(4.5rem,10vw,8rem)] font-bold leading-[0.85] tracking-tighter tabular-nums">
              <JamHidup jamAwal={jamWIB()} />
            </p>
            <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              Jakarta, Indonesia · WIB
            </p>
          </BlurFade>

          {/* Jejak digital — satu baris ringkas berisi angka, bukan tumpukan
              blok. Angka yang berdampingan lebih mudah dibandingkan daripada
              yang bertumpuk. */}
          <BlurFade delay={0.16} className="mt-12">
            <div className="flex flex-wrap items-end gap-x-10 gap-y-5">
              {github && (
                <Statistik
                  ikon={<SiGithub className="size-3.5" />}
                  label="kontribusi setahun"
                  nilai={github.total.toLocaleString("id-ID")}
                />
              )}
              {waka && (
                <Statistik
                  ikon={<Code2 className="size-3.5" />}
                  label={
                    waka.bahasa[0]
                      ? `${waka.bahasa[0].nama} ${Math.round(waka.bahasa[0].persen)}%`
                      : "total ngoding"
                  }
                  nilai={waka.total.replace(" hrs", "j").replace(" mins", "m")}
                />
              )}
            </div>

            {/* Heatmap jadi pita tipis di bawah angka — perannya tekstur
                pendukung, bukan grafik utama. */}
            {github && (
              <div className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-800">
                <KontribusiGrid data={github} minggu={28} />
              </div>
            )}
          </BlurFade>

          {/* Now playing — ditempel di dasar panel, terpisah dari blok utama.
              Ini "denyut latar", bukan bagian dari perkenalan. */}
          {lagu && (
            <BlurFade
              delay={0.24}
              className="absolute inset-x-10 bottom-10 xl:inset-x-16 xl:bottom-12"
            >
              <div className="flex items-center gap-3">
                <SiSpotify className="size-4 shrink-0 text-[#1DB954]" />
                <div className="min-w-0 flex-1">
                  <NowPlaying lagu={lagu} />
                </div>
              </div>
            </BlurFade>
          )}
        </section>

        {/* ── KANAN: form ───────────────────────────────────────────────── */}
        <section className="flex items-center justify-center p-6 sm:p-10">
          <BlurFade className="w-full max-w-sm">
            {/* Identitas ringkas — hanya saat panel kiri disembunyikan */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-800">
                {profil?.foto ? (
                  <Image
                    src={profil.foto}
                    alt={profil.nama}
                    fill
                    sizes="44px"
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight">
                  {profil?.nama ?? "Faiz Hazim Hawari"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Fullstack Developer &amp; Designer
                </p>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              <ShinyText>Halo lagi</ShinyText>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Masuk untuk melanjutkan.
            </p>

            <div className="mt-8">
              {/* LoginForm membaca ?next= lewat useSearchParams, jadi butuh
                  Suspense boundary agar halaman tetap bisa di-prerender. */}
              <Suspense fallback={<FormSkeleton />}>
                <LoginForm />
              </Suspense>
            </div>
          </BlurFade>
        </section>
      </div>
    </main>
  );
}

/**
 * Satu angka di panel kiri.
 *
 * Angka dulu, label belakangan — mata menangkap angkanya lebih cepat kalau
 * dia yang paling menonjol, bukan keterangannya.
 */
function Statistik({
  ikon,
  nilai,
  label,
}: {
  ikon: React.ReactNode;
  nilai: string;
  label: string;
}) {
  return (
    <div>
      <p className="text-2xl font-bold leading-none tracking-tight tabular-nums">
        {nilai}
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        {ikon}
        {label}
      </p>
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
