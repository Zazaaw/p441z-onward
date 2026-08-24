import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Code2, MapPin, Flame } from "lucide-react";
import { SiGithub, SiSpotify } from "react-icons/si";
import BlurFade from "@/components/effects/blur-fade";
import DotPattern from "@/components/effects/dot-pattern";
import { ShinyText } from "@/components/effects/shiny-text";
import { JamHidup } from "@/components/jam-hidup";
import { KontribusiGrid } from "@/components/kontribusi-grid";
import { NowPlaying } from "@/components/now-playing";
import { Bento } from "@/components/bento";
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

  const bahasaTeratas = waka?.bahasa[0];

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.25fr_1fr]">
      {/* ── KIRI: bento grid ─────────────────────────────────────────────
          Kartu berukuran berbeda-beda, bukan satu kolom memanjang. Ruang
          kosong yang tadi menganga jadi terpakai, dan tiap potongan info
          punya wadahnya sendiri. */}
      <section className="relative hidden overflow-hidden bg-neutral-950 p-8 text-white lg:block xl:p-10">
        <DotPattern
          width={24}
          height={24}
          cx={1}
          cy={1}
          cr={1}
          className="text-white/15 [mask-image:radial-gradient(140%_100%_at_15%_0%,white,transparent)]"
        />

        <BlurFade className="relative h-full">
          {/* 6 kolom supaya bisa dibagi 2/3/6 — lebih luwes daripada 3 kolom
              saat menata kartu dengan lebar berbeda. Baris kedua memakai 1fr
              agar kartu jam memanjang mengisi sisa tinggi layar. */}
          <div className="grid h-full grid-cols-6 grid-rows-[auto_1fr_auto_auto] gap-3">
            {/* Identitas — melebar penuh */}
            <Bento className="col-span-6 p-5">
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
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold leading-tight">
                    {profil?.nama ?? "Faiz Hazim Hawari"}
                  </p>
                  <p className="truncate text-sm text-white/45">
                    Fullstack Developer &amp; Designer
                  </p>
                </div>
                <p className="ml-auto hidden shrink-0 items-center gap-1.5 text-xs text-white/40 xl:flex">
                  <MapPin className="size-3.5" />
                  Jakarta, ID
                </p>
              </div>
            </Bento>

            {/* Jam — kartu terbesar, mengisi sisa tinggi. Presensi soal waktu,
                jadi waktu yang paling besar. clamp() supaya ikut menyusut di
                layar sempit tanpa perlu breakpoint tambahan. */}
            <Bento className="col-span-4 justify-center p-6">
              <p className="text-sm text-white/40">{namaHariWIB()}</p>
              <p className="mt-1 text-[clamp(3.5rem,7vw,6rem)] font-bold leading-none tracking-tighter tabular-nums">
                <JamHidup jamAwal={jamWIB()} />
              </p>
              <p className="mt-2 text-sm text-white/40">{tanggalWIB()} · WIB</p>
            </Bento>

            {/* Dua kartu angka bertumpuk di samping jam */}
            <div className="col-span-2 grid grid-rows-2 gap-3">
              {waka && (
                <Bento className="justify-center p-5">
                  <p className="flex items-center gap-1.5 text-xs text-white/40">
                    <Code2 className="size-3.5" />
                    Total ngoding
                  </p>
                  <p className="mt-1.5 text-2xl font-bold leading-none tracking-tight">
                    {/* "307 hrs 16 mins" → "307j 16m" agar muat di kartu sempit */}
                    {waka.total.replace(" hrs", "j").replace(" mins", "m")}
                  </p>
                  {bahasaTeratas && (
                    <p className="mt-1.5 truncate text-xs text-white/40">
                      {bahasaTeratas.nama} {Math.round(bahasaTeratas.persen)}%
                    </p>
                  )}
                </Bento>
              )}

              {github && (
                <Bento className="justify-center p-5">
                  <p className="flex items-center gap-1.5 text-xs text-white/40">
                    <Flame className="size-3.5" />
                    Kontribusi
                  </p>
                  <p className="mt-1.5 text-2xl font-bold leading-none tracking-tight tabular-nums">
                    {github.total.toLocaleString("id-ID")}
                  </p>
                  <p className="mt-1.5 text-xs text-white/40">setahun</p>
                </Bento>
              )}
            </div>

            {/* Heatmap GitHub — melebar penuh, jadi pita tekstur */}
            {github && (
              <Bento className="col-span-6 p-5">
                <div className="mb-3 flex items-center gap-1.5 text-xs text-white/40">
                  <SiGithub className="size-3.5" />
                  Aktivitas GitHub
                </div>
                <div className="overflow-hidden">
                  <KontribusiGrid data={github} minggu={30} />
                </div>
              </Bento>
            )}

            {/* Now playing */}
            {lagu && (
              <Bento className="col-span-6 p-5">
                <p className="mb-3 flex items-center gap-1.5 text-xs text-white/40">
                  <SiSpotify className="size-3.5 text-[#1DB954]" />
                  {lagu.sedangDiputar ? "Sedang diputar" : "Terakhir diputar"}
                </p>
                <NowPlaying lagu={lagu} />
              </Bento>
            )}
          </div>
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
