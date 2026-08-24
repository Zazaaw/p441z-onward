import type { Metadata } from "next";
import { Suspense } from "react";
import { Fingerprint, Clock3, ShieldCheck, Flame } from "lucide-react";
import BlurFade from "@/components/effects/blur-fade";
import DotPattern from "@/components/effects/dot-pattern";
import { ShinyText } from "@/components/effects/shiny-text";
import { JamHidup } from "@/components/jam-hidup";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";
import { ringkasLogin } from "@/services/presensi";
import { jamWIB, tanggalWIB, namaHariWIB } from "@/services/waktu";

export const metadata: Metadata = { title: "Masuk" };

// Panel kiri menampilkan jam dan angka terkini, jadi tidak boleh di-cache.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const ringkas = await ringkasLogin();

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      {/* ── KIRI: panel identitas ──────────────────────────────────────────
          Sengaja selalu gelap, tidak ikut tema. Sisi ini berperan sebagai
          "papan nama" produk; kontras tetapnya yang membuat sisi kanan
          (form) terbaca sebagai area kerja.
          Disembunyikan di bawah lg — di layar kecil form yang harus dapat
          seluruh ruang, bukan dekorasi. */}
      <section className="relative hidden overflow-hidden bg-neutral-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <DotPattern
          width={22}
          height={22}
          cx={1}
          cy={1}
          cr={1}
          className="text-white/25 [mask-image:radial-gradient(120%_80%_at_30%_20%,white,transparent)]"
        />

        {/* Merek */}
        <BlurFade className="relative">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              <Fingerprint className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Absensi</p>
              <p className="text-xs text-white/50">Panel pengelolaan</p>
            </div>
          </div>
        </BlurFade>

        {/* Jam besar — inti panel ini. Presensi soal waktu, jadi waktu yang
            ditampilkan paling besar. */}
        <BlurFade delay={0.1} className="relative">
          <p className="text-sm text-white/50">{namaHariWIB()}</p>
          <p className="mt-1 text-7xl font-bold tracking-tight tabular-nums">
            <JamHidup jamAwal={jamWIB()} />
          </p>
          <p className="mt-2 text-sm text-white/50">
            {tanggalWIB()} · Waktu Indonesia Barat
          </p>
        </BlurFade>

        {/* Angka nyata dari ESS. Kalau database tidak terjangkau, seluruh
            blok ini hilang — bukan menampilkan nol yang menyesatkan. */}
        <BlurFade delay={0.2} className="relative">
          {ringkas ? (
            <div className="flex gap-8 border-t border-white/10 pt-6">
              <Angka
                icon={<Clock3 className="size-3.5" />}
                nilai={ringkas.totalHari}
                label="presensi tercatat"
              />
              <Angka
                icon={<ShieldCheck className="size-3.5" />}
                nilai={ringkas.hadir}
                label="tepat waktu"
              />
              {ringkas.streak > 0 && (
                <Angka
                  icon={<Flame className="size-3.5" />}
                  nilai={ringkas.streak}
                  label="beruntun"
                />
              )}
            </div>
          ) : (
            <p className="border-t border-white/10 pt-6 text-xs text-white/40">
              Sistem pencatatan kehadiran internal.
            </p>
          )}
        </BlurFade>
      </section>

      {/* ── KANAN: form ─────────────────────────────────────────────────── */}
      <section className="relative flex items-center justify-center p-6 sm:p-10">
        {/* Tekstur tipis, hanya di layar kecil — saat panel kiri tidak ada,
            latar polos terasa kosong. */}
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
          {/* Merek versi ringkas — hanya muncul kalau panel kiri disembunyikan,
              supaya halaman tetap punya identitas di layar kecil. */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800">
              <Fingerprint className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Absensi</p>
              <p className="text-xs text-muted-foreground">Panel pengelolaan</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            <ShinyText>Selamat datang</ShinyText>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masuk untuk mengelola presensi dan otomasinya.
          </p>

          <div className="mt-8">
            {/* LoginForm membaca ?next= lewat useSearchParams, jadi butuh
                Suspense boundary agar halaman tetap bisa di-prerender. */}
            <Suspense fallback={<FormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>

          <KartuPercobaan />

          <p className="mt-10 text-xs text-muted-foreground">
            Akses terbatas. Hubungi administrator bila belum punya akun.
          </p>
        </BlurFade>
      </section>
    </main>
  );
}

function Angka({
  icon,
  nilai,
  label,
}: {
  icon: React.ReactNode;
  nilai: number;
  label: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-2xl font-bold tabular-nums">
        <span className="text-white/40">{icon}</span>
        {nilai}
      </p>
      <p className="mt-0.5 text-xs text-white/50">{label}</p>
    </div>
  );
}

/**
 * Petunjuk akun percobaan.
 *
 * HANYA tampil saat development. Di production dia hilang total — bukan
 * sekadar disembunyikan dengan CSS, tapi tidak ikut ter-render sama sekali,
 * jadi kredensialnya tidak ada di HTML yang dikirim.
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
