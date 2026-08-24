import { CalendarOff, CheckCircle2, Clock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BarisPresensi } from "@/services/presensi";
import { formatJamWIB } from "@/services/waktu";

/**
 * Badge kecil di atas judul form, berisi keadaan presensi hari ini.
 *
 * Sengaja memuat data nyata, bukan label hiasan — begitu halaman dibuka kita
 * sudah tahu apakah hari ini libur, belum absen, sudah masuk, atau sudah
 * pulang, tanpa perlu login dulu.
 */
export function BadgeStatus({
  presensi,
  libur,
}: {
  presensi: BarisPresensi | null;
  libur: { libur: boolean; nama?: string };
}) {
  const { ikon, teks, nada } = ringkas(presensi, libur);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        nada
      )}
    >
      {ikon}
      {teks}
    </span>
  );
}

function ringkas(
  presensi: BarisPresensi | null,
  libur: { libur: boolean; nama?: string }
) {
  // Libur didahulukan: kalaupun ada baris presensi, statusnya tetap libur.
  if (libur.libur) {
    return {
      ikon: <CalendarOff className="size-3.5" />,
      teks: libur.nama ?? "Hari libur",
      nada: "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-300",
    };
  }

  if (presensi?.jam_keluar) {
    return {
      ikon: <LogOut className="size-3.5" />,
      teks: `Sudah pulang · ${formatJamWIB(presensi.jam_keluar)}`,
      nada: "border-neutral-300 bg-neutral-500/10 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300",
    };
  }

  if (presensi?.jam_masuk) {
    // Status di database bukan cuma hadir/telat — ada juga "dinas", "cuti",
    // dsb. Yang perlu dibedakan warnanya hanya telat; sisanya tampilkan apa
    // adanya supaya badge tidak berbohong.
    const status = presensi.status?.toLowerCase() ?? "";
    const telat = status === "telat";
    const label =
      status && status !== "hadir"
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "Sudah absen";
    return {
      ikon: <CheckCircle2 className="size-3.5" />,
      teks: `${label} · ${formatJamWIB(presensi.jam_masuk)}`,
      nada: telat
        ? "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300"
        : "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    };
  }

  return {
    ikon: <Clock className="size-3.5" />,
    teks: "Belum absen hari ini",
    nada: "border-neutral-300 bg-neutral-500/10 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300",
  };
}
