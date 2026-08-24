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
            Tidak lagi berlatar hitam pekat — cukup pembatas tipis di kanan,
            supaya pola latar mengalir menembus kedua sisi sebagai satu
            kesatuan, persis seperti halaman portfolio. */}
        <section className="hidden flex-col justify-between border-r border-neutral-200 p-10 lg:flex xl:p-14 dark:border-neutral-800">
          {/* Identitas */}
          <BlurFade>
            <div className="flex items-center gap-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-full ring-1 ring-neutral-200 dark:ring-neutral-800">
                {profil?.foto ? (
                  <Image
                    src={profil.foto}
                    alt={profil.nama}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex size-full items-center justify-center bg-muted text-sm font-bold">
                    FH
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold leading-tight">
                  {profil?.nama ?? "Faiz Hazim Hawari"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  Fullstack Developer &amp; Designer
                </p>
              </div>
            </div>
          </BlurFade>

          {/* Jam — elemen terbesar. Presensi soal waktu. */}
          <BlurFade delay={0.1}>
            <p className="text-sm text-muted-foreground">{namaHariWIB()}</p>
            <p className="mt-1 text-[clamp(4rem,9vw,7.5rem)] font-bold leading-none tracking-tighter tabular-nums">
              <JamHidup jamAwal={jamWIB()} />
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {tanggalWIB()} · Jakarta, WIB
            </p>
          </BlurFade>

          {/* Jejak digital — dipisah garis tipis, bukan kotak-kotak */}
          <BlurFade delay={0.2} className="space-y-5">
            {github && (
              <div>
                <div className="mb-2.5 flex items-baseline justify-between">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <SiGithub className="size-3.5" />
                    Kontribusi setahun terakhir
                  </p>
                  <p className="text-xs font-medium tabular-nums">
                    {github.total.toLocaleString("id-ID")}
                  </p>
                </div>
                <KontribusiGrid data={github} minggu={26} />
              </div>
            )}

            {waka && (
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-neutral-200 pt-5 dark:border-neutral-800">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Code2 className="size-3.5" />
                  Total ngoding
                </p>
                <p className="text-sm font-medium">{waka.total}</p>
                {waka.bahasa.length > 0 && (
                  <p className="truncate text-xs text-muted-foreground">
                    {waka.bahasa
                      .slice(0, 3)
                      .map((b) => `${b.nama} ${Math.round(b.persen)}%`)
                      .join(" · ")}
                  </p>
                )}
              </div>
            )}

            {lagu && (
              <div className="border-t border-neutral-200 pt-5 dark:border-neutral-800">
                <p className="mb-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <SiSpotify className="size-3.5 text-[#1DB954]" />
                  {lagu.sedangDiputar ? "Sedang diputar" : "Terakhir diputar"}
                </p>
                <NowPlaying lagu={lagu} />
              </div>
            )}
          </BlurFade>
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
