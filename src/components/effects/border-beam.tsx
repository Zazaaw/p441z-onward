"use client";

import { cn } from "@/lib/utils";

/**
 * BorderBeam — seberkas cahaya tipis berputar menyusuri tepi elemen.
 *
 * Dipakai HEMAT: satu per halaman, pada kartu yang paling penting. Kalau dua
 * kartu sama-sama berkilau, tidak ada yang menonjol dan efeknya jadi sia-sia.
 *
 * Cara kerjanya: sebuah kotak kecil digerakkan sepanjang `offset-path` yang
 * mengikuti bentuk border induknya. Karena memakai offset-path, dia otomatis
 * mengikuti radius sudut — tidak perlu menghitung jalur manual.
 *
 * Induknya WAJIB `relative` dan punya radius yang sama.
 */
export function BorderBeam({
  size = 200,
  duration = 12,
  delay = 0,
  className,
}: {
  /** Panjang berkas dalam px. */
  size?: number;
  /** Detik untuk satu putaran penuh. Makin besar makin tenang. */
  duration?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={
        {
          "--size": size,
          "--duration": `${duration}s`,
          "--delay": `-${delay}s`,
        } as React.CSSProperties
      }
      className={cn(
        // Lapisan border transparan yang memuat berkas, memakai mask agar
        // hanya bagian tepi yang terlihat.
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        "[border:1px_solid_transparent]",
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect]",
        "[mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        // Berkasnya sendiri.
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)]",
        "after:animate-border-beam after:[animation-delay:var(--delay)]",
        "after:[background:linear-gradient(to_left,var(--beam-from),var(--beam-to),transparent)]",
        "after:[offset-anchor:90%_50%]",
        "after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        className
      )}
    />
  );
}

export default BorderBeam;
