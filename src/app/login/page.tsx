import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Code2, MapPin } from "lucide-react";
import { SiGithub } from "react-icons/si";
import BlurFade from "@/components/effects/blur-fade";
import DotPattern from "@/components/effects/dot-pattern";
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
import { jamWIB } from "@/services/waktu";

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
    <main className="grid min-h-dvh lg:grid-cols-[1.15fr_1fr]">
      {/* ── KIRI: sisi personal ───────────────────────────────────────────
          Selalu gelap, tidak ikut tema. Ini "halaman muka" — yang dilihat
          orang sebelum masuk, jadi isinya siapa aku, bukan aplikasi apa ini. */}
      <section className="relative hidden overflow-hidden bg-neutral-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <DotPattern
          width={24}
          height={24}
          cx={1}
          cy={1}
          cr={1}
          className="text-white/20 [mask-image:radial-gradient(130%_90%_at_20%_10%,white,transparent)]"
        />

        {/* Identitas */}
        <BlurFade className="relative">
          <div className="flex items-center gap-4">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
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
                <span className="flex size-full items-center justify-center bg-white/10 text-sm font-bold">
                  FH
                </span>
              )}
            </div>
            <div>
              <p className="text-base font-semibold leading-tight">
                {profil?.nama ?? "Faiz Hazim Hawari"}
              </p>
              <p className="text-sm text-white/45">
                Fullstack Developer & Designer
              </p>
            </div>
          </div>
        </BlurFade>

        {/* Jam — tetap jadi elemen terbesar. Ini gerbang aplikasi presensi,
            jadi waktu tetap yang paling penting meski nuansanya personal. */}
        <BlurFade delay={0.1} className="relative">
          <p className="text-8xl font-bold leading-none tracking-tighter tabular-nums">
            <JamHidup jamAwal={jamWIB()} />
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-white/45">
            <MapPin className="size-3.5" />
            Jakarta, Indonesia · WIB
          </p>
        </BlurFade>

        {/* Jejak digital — hanya bagian yang datanya benar-benar ada. */}
        <BlurFade delay={0.2} className="relative space-y-6">
          {github && (
            <div>
              <div className="mb-2.5 flex items-baseline justify-between">
                <p className="flex items-center gap-1.5 text-xs text-white/45">
                  <SiGithub className="size-3.5" />
                  Kontribusi setahun terakhir
                </p>
                <p className="text-xs font-medium tabular-nums text-white/70">
                  {github.total.toLocaleString("id-ID")}
                </p>
              </div>
              <KontribusiGrid data={github} minggu={22} />
            </div>
          )}

          {waka && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5">
              <div>
                <p className="flex items-center gap-1.5 text-xs text-white/45">
                  <Code2 className="size-3.5" />
                  Total ngoding
                </p>
                <p className="mt-0.5 text-sm font-medium">{waka.total}</p>
              </div>
              {waka.bahasa.length > 0 && (
                <div className="min-w-0">
                  <p className="text-xs text-white/45">7 hari terakhir</p>
                  <p className="mt-0.5 truncate text-sm font-medium">
                    {waka.bahasa
                      .map((b) => `${b.nama} ${Math.round(b.persen)}%`)
                      .join(" · ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {lagu && (
            <div className="border-t border-white/10 pt-5">
              <p className="mb-2.5 text-xs text-white/45">
                {lagu.sedangDiputar ? "Sedang diputar" : "Terakhir diputar"}
              </p>
              <NowPlaying lagu={lagu} />
            </div>
          )}
        </BlurFade>
      </section>

      {/* ── KANAN: form ─────────────────────────────────────────────────── */}
      <section className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <DotPattern
            width={22}
            height={22}
            cx={1}
            cy={1}
            cr={1}
            className="[mask-image:radial-gradient(400px_circle_at_50%_30%,white,transparent)]"
          />
        </div>

        <BlurFade className="relative w-full max-w-sm">
          {/* Identitas ringkas — hanya di layar kecil, saat panel kiri hilang. */}
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
            <div>
              <p className="text-sm font-semibold leading-tight">
                {profil?.nama ?? "Faiz Hazim Hawari"}
              </p>
              <p className="text-xs text-muted-foreground">
                Fullstack Developer & Designer
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

          <KartuPercobaan />
        </BlurFade>
      </section>
    </main>
  );
}

/**
 * Petunjuk akun percobaan.
 *
 * HANYA saat development. Di production tidak ikut ter-render sama sekali,
 * jadi kredensialnya tidak ada di HTML yang dikirim ke browser.
 */
function KartuPercobaan() {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-3 dark:border-neutral-700">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Mode pengembangan
      </p>
      <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
        admin@absensi.test · admin123
      </p>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-14" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
