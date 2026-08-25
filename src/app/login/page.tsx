import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import BlurFade from "@/components/effects/blur-fade";
import DotPattern from "@/components/effects/dot-pattern";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoOnward, LogoOnwardPanjang } from "@/components/logo-onward";
import { KontribusiGrid } from "@/components/kontribusi-grid";
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
    // 50/50 seperti referensi. Kartu di kiri dibatasi max-w-md, jadi lebar
    // berlebih menjadi ruang napas di sekelilingnya — bukan meregangkan
    // isinya.
    <div className="grid min-h-dvh w-full grid-cols-1 lg:grid-cols-2">
      {/* ── KIRI ─────────────────────────────────────────────────────────
          Mengikuti pola referensi: satu kolom terpusat yang dibungkus KARTU
          berlatar gradien lembut, lalu kartu kedua yang lebih kecil di
          bawahnya sebagai pelengkap.

          Kartu itulah yang membuat susunan terpusat terbaca disengaja —
          tanpa latar, elemen yang dipusatkan cuma terlihat mengambang. */}
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-3 p-4 sm:p-6">
        <DotPattern
          width={22}
          height={22}
          cx={1}
          cy={1}
          cr={1}
          className="pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(65%_55%_at_50%_45%,white,transparent)]"
        />

        {/* ── Kartu utama ──────────────────────────────────────────────── */}
        <BlurFade className="w-full max-w-md">
          {/* Gradien halus dari atas ke bawah, bukan warna rata: itu yang
              memberi kartu kesan "berbahan" seperti di referensi. */}
          <div className="rounded-[1.75rem] border border-neutral-200/80 bg-gradient-to-b from-neutral-100 to-neutral-50/40 px-8 py-10 text-center sm:px-10 dark:border-neutral-800/80 dark:from-neutral-900 dark:to-neutral-950/40">
            {/* Merek */}
            <div className="flex items-center justify-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
              <LogoOnward className="text-lg" />
            </div>

            {/* Tagline */}
            <h1 className="mt-7 text-[clamp(2.5rem,4vw,3.25rem)]">
              <LogoOnwardPanjang />
            </h1>

            {/* Kutipan berperan sebagai deskripsi, seperti paragraf di
                bawah judul pada referensi. */}
            <KutipanHarian className="mx-auto mt-4 max-w-[20rem] text-sm leading-relaxed text-muted-foreground" />

            {/* Isi form tetap rata kiri di dalam kartu yang rata tengah —
                label dan input yang ikut terpusat sulit dipindai. */}
            <div className="mt-8 text-left">
              {/* LoginForm membaca ?next= lewat useSearchParams, jadi butuh
                  Suspense boundary agar tetap bisa di-prerender. */}
              <Suspense fallback={<FormSkeleton />}>
                <LoginForm />
              </Suspense>
            </div>

            <p className="mt-6 flex items-center justify-center gap-1.5 border-t border-neutral-200 pt-5 text-xs text-muted-foreground dark:border-neutral-800">
              <ShieldCheck className="size-3.5 shrink-0" />
              Akun dikelola terpusat lewat portfolio.
            </p>
          </div>
        </BlurFade>

        {/* ── Kartu kedua ──────────────────────────────────────────────────
            Sejajar dengan kartu "20k+ users" di referensi. Perannya sama —
            bukti bahwa ada aktivitas nyata di balik aplikasi ini — hanya
            isinya jejak digital, karena itu yang datanya memang kita punya. */}
        {(github || waka) && (
          <BlurFade delay={0.12} className="w-full max-w-md">
            <div className="flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-neutral-100/60 px-6 py-4 dark:border-neutral-800/80 dark:bg-neutral-900/50">
              <div className="relative size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-neutral-200 dark:ring-neutral-800">
                {profil?.foto ? (
                  <Image
                    src={profil.foto}
                    alt={nama}
                    fill
                    sizes="36px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex size-full items-center justify-center bg-muted text-[10px] font-bold">
                    FH
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {github
                    ? `${github.total.toLocaleString("id-ID")} kontribusi setahun ini`
                    : "Terus berjalan"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {waka
                    ? `${waka.total.replace(" hrs", " jam").replace(" mins", " menit")} ngoding`
                    : namaHariWIB()}
                  {" · "}
                  {tanggalPanjangWIB()}
                </p>
              </div>

              {/* Lebarnya dipatok lewat WADAH, bukan lewat className grid-nya:
                  KontribusiGrid membawa `w-full` sendiri, jadi w-24 yang
                  dioper dari luar kalah dan kotaknya melar mengikuti sisa
                  ruang kartu. */}
              {github && (
                <div className="hidden w-[5.5rem] shrink-0 text-foreground sm:block">
                  <KontribusiGrid data={github} minggu={10} />
                </div>
              )}
            </div>
          </BlurFade>
        )}
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
