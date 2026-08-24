import Image from "next/image";
import { CalendarOff, Clock } from "lucide-react";
import BlurFade from "@/components/effects/blur-fade";
import DotPattern from "@/components/effects/dot-pattern";
import type { ProfilSaya, BarisPresensi } from "@/services/presensi";
import { formatJamWIB, keMenit } from "@/services/waktu";

/**
 * Hero sapaan di puncak dashboard.
 *
 * Isinya menyesuaikan keadaan, bukan teks statis: sapaan mengikuti jam,
 * dan baris ringkasan berubah tergantung sudah absen atau belum. Tujuannya
 * begitu halaman dibuka, satu kalimat sudah menjawab "aku harus ngapain".
 */

/** Sapaan mengikuti jam WIB. */
function sapaan(jam: string): string {
  const m = keMenit(jam);
  if (m < 4 * 60) return "Masih begadang";
  if (m < 11 * 60) return "Selamat pagi";
  if (m < 15 * 60) return "Selamat siang";
  if (m < 18 * 60) return "Selamat sore";
  return "Selamat malam";
}

/** Ambil nama depan saja — sapaan pakai nama lengkap terasa kaku. */
function namaDepan(nama: string): string {
  return nama.split(" ")[0];
}

/** Inisial untuk fallback kalau foto gagal dimuat. */
function inisial(nama: string): string {
  const bagian = nama.trim().split(/\s+/);
  return (bagian[0]?.[0] ?? "") + (bagian[1]?.[0] ?? "");
}

export function HeroSapaan({
  profil,
  baris,
  jamSekarang,
  tanggal,
  hari,
  libur,
}: {
  profil: ProfilSaya;
  baris: BarisPresensi | null;
  jamSekarang: string;
  tanggal: string;
  hari: string;
  libur: { libur: boolean; nama?: string };
}) {
  // Satu kalimat yang menjawab "aku harus ngapain".
  const ringkasan = (() => {
    if (libur.libur) return `Hari ini libur — ${libur.nama}.`;
    if (!baris) return "Belum absen hari ini.";
    if (!baris.jam_keluar)
      return `Masuk ${formatJamWIB(baris.jam_masuk)}, belum check-out.`;
    return `Masuk ${formatJamWIB(baris.jam_masuk)}, keluar ${formatJamWIB(
      baris.jam_keluar
    )}.`;
  })();

  return (
    <BlurFade>
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
        {/* Tekstur tipis — hanya di hero, supaya jadi satu-satunya bagian
            yang "bersuara" sementara sisa halaman tetap tenang. */}
        <DotPattern
          width={18}
          height={18}
          cx={1}
          cy={1}
          cr={1}
          className="text-neutral-400/50 [mask-image:linear-gradient(to_left,white,transparent_60%)]"
        />

        <div className="relative flex flex-wrap items-center gap-5 p-6">
          {/* Foto profil dari ESS */}
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
            {profil.foto ? (
              <Image
                src={profil.foto}
                alt={profil.nama}
                fill
                sizes="64px"
                className="object-cover"
                // Foto ESS bisa saja dihapus/diganti; jangan sampai
                // seluruh hero gagal render karenanya.
                unoptimized
              />
            ) : (
              <span className="flex size-full items-center justify-center text-lg font-bold text-muted-foreground">
                {inisial(profil.nama)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">
              {sapaan(jamSekarang)},
            </p>
            <h1 className="truncate text-2xl font-bold tracking-tight">
              {namaDepan(profil.nama)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{ringkasan}</p>
          </div>

          {/* Jam & tanggal — rata kanan di layar lebar */}
          <div className="flex items-center gap-2 text-right sm:flex-col sm:items-end sm:gap-0">
            <p className="flex items-center gap-1.5 text-2xl font-bold tabular-nums">
              <Clock className="size-4 text-muted-foreground sm:hidden" />
              {jamSekarang}
            </p>
            <p className="text-xs text-muted-foreground">
              {hari}, {tanggal}
            </p>
          </div>
        </div>

        {/* Pita libur — hanya muncul kalau memang libur */}
        {libur.libur && (
          <div className="relative flex items-center gap-2 border-t border-blue-500/20 bg-blue-500/10 px-6 py-3">
            <CalendarOff className="size-4 shrink-0 text-blue-500" />
            <p className="text-sm text-blue-500">
              <strong>{libur.nama}</strong> — tidak perlu absen.
            </p>
          </div>
        )}
      </div>
    </BlurFade>
  );
}
