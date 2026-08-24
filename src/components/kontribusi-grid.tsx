import { cn } from "@/lib/utils";
import type { Kontribusi } from "@/services/portfolio";

/**
 * Heatmap kontribusi GitHub, gaya kalender bawaan GitHub tapi monokrom.
 *
 * Warnanya memakai `currentColor` dengan opacity bertingkat, bukan hijau —
 * jadi ikut warna teks induknya dan otomatis benar di terang maupun gelap,
 * tanpa perlu varian `dark:` sendiri.
 */
export function KontribusiGrid({
  data,
  /** Berapa minggu terakhir yang ditampilkan. */
  minggu = 20,
  className,
}: {
  data: Kontribusi;
  minggu?: number;
  className?: string;
}) {
  // Ambil ekor datanya, lalu potong rapi ke kelipatan 7 supaya kolom
  // terakhir tidak setengah jadi.
  const ambil = minggu * 7;
  const hari = data.hari.slice(-ambil);

  // Susun jadi kolom-kolom berisi 7 hari (satu kolom = satu minggu).
  const kolom: typeof hari[] = [];
  for (let i = 0; i < hari.length; i += 7) kolom.push(hari.slice(i, i + 7));

  // Skala relatif terhadap hari tersibuk, bukan angka mutlak — supaya pola
  // tetap terlihat baik untuk yang commit 2x maupun 20x sehari.
  const maks = Math.max(1, ...hari.map((h) => h.jumlah));

  const tingkat = (n: number): string => {
    if (n === 0) return "opacity-[0.10]";
    const r = n / maks;
    if (r > 0.66) return "opacity-90";
    if (r > 0.33) return "opacity-55";
    return "opacity-30";
  };

  return (
    <div className={cn("flex gap-[3px]", className)}>
      {kolom.map((mgg, i) => (
        <div key={i} className="flex flex-col gap-[3px]">
          {mgg.map((h) => (
            <div
              key={h.tanggal}
              title={`${h.tanggal} · ${h.jumlah} kontribusi`}
              className={cn(
                "size-[9px] rounded-[2px] bg-current",
                tingkat(h.jumlah)
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
