"use client";

import { cn } from "@/lib/utils";

/**
 * ShinyText — kilau pelan menyapu teks.
 *
 * Efeknya dibuat dari gradien yang bergerak di belakang teks, lalu di-clip ke
 * bentuk hurufnya (`bg-clip-text` + `text-transparent`). Tidak ada elemen
 * tambahan, jadi teksnya tetap bisa diseleksi dan dibaca screen reader.
 *
 * Keyframe `shimmer` sengaja diam 90% waktu dan menyapu cepat di sisanya —
 * kilau terus-menerus akan mengganggu, sekali-sekali justru menarik mata.
 */
export function ShinyText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      style={{ "--shimmer-width": "120px" } as React.CSSProperties}
      className={cn(
        "animate-shimmer bg-clip-text text-transparent",
        // Gradien: warna dasar → sorotan → warna dasar.
        "bg-[linear-gradient(110deg,var(--shine-base),35%,var(--shine-hi),50%,var(--shine-base),75%,var(--shine-base))]",
        "bg-[length:250%_100%]",
        className
      )}
    >
      {children}
    </span>
  );
}

export default ShinyText;
