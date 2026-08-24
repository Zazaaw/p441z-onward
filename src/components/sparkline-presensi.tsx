import { cn } from "@/lib/utils";
import type { BarisPresensi } from "@/services/presensi";

/**
 * Sparkline pola presensi.
 *
 * Bukan grafik garis — tiap hari digambar sebagai satu batang, tingginya
 * mewakili lama kerja dan warnanya mewakili status. Untuk data harian yang
 * jumlahnya sedikit, batang lebih mudah dibaca daripada garis: tiap hari
 * bisa ditunjuk satu per satu.
 *
 * Batang abu-abu tipis = ada presensi tapi jam keluarnya kosong, jadi
 * durasinya tidak diketahui. Itu justru yang paling ingin kamu lihat.
 */
export function SparklinePresensi({
  data,
  className,
}: {
  data: BarisPresensi[];
  className?: string;
}) {
  // Urutkan lama ke baru supaya sumbu waktu mengalir ke kanan.
  const urut = [...data].reverse();

  /** Lama kerja dalam jam. null kalau belum check-out. */
  const durasi = (r: BarisPresensi): number | null => {
    if (!r.jam_masuk || !r.jam_keluar) return null;
    const ms = new Date(r.jam_keluar).getTime() - new Date(r.jam_masuk).getTime();
    return ms > 0 ? ms / 3_600_000 : null;
  };

  const semua = urut.map(durasi).filter((d): d is number => d !== null);
  // Skala minimal 9 jam supaya hari normal tidak terlihat memenuhi grafik.
  const maks = Math.max(9, ...semua);

  return (
    <div className={cn("flex h-16 items-end gap-1", className)}>
      {urut.map((r) => {
        const d = durasi(r);
        const tinggi = d === null ? 22 : Math.max(12, (d / maks) * 100);

        const warna =
          d === null
            ? "bg-neutral-300 dark:bg-neutral-700"
            : r.status === "hadir"
            ? "bg-emerald-500/70"
            : r.status === "telat"
            ? "bg-amber-500/70"
            : "bg-neutral-400 dark:bg-neutral-600";

        const judul = [
          r.tanggal,
          r.status,
          d === null ? "belum check-out" : `${d.toFixed(1)} jam`,
        ].join(" · ");

        return (
          <div
            key={r.id}
            title={judul}
            style={{ height: `${tinggi}%` }}
            className={cn(
              "min-w-0 flex-1 rounded-sm transition-all duration-300 hover:opacity-100",
              warna,
              // Batang tanpa check-out dibuat samar — hadir sebagai celah,
              // bukan sebagai data yang setara.
              d === null ? "opacity-50" : "opacity-90"
            )}
          />
        );
      })}
    </div>
  );
}
