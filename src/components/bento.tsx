import { cn } from "@/lib/utils";

/**
 * Kartu bento untuk panel login.
 *
 * Bayangannya meniru pola di portfolio: tiga lapis shadow yang makin lebar
 * dan makin samar, bukan satu shadow tunggal. Itu yang membuat kartu terasa
 * mengambang lembut, bukan ditempel.
 *
 * Versi gelap memakai inset glow dari atas — trik yang sama dipakai di
 * portfolio supaya kartu tetap terbaca di latar hitam tanpa perlu border
 * terang yang mencolok.
 */
export function Bento({
  children,
  className,
  /** Isi lapisan paling belakang (grafik, gambar, pola). */
  latar,
}: {
  children: React.ReactNode;
  className?: string;
  latar?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-xl",
        "bg-white/[0.03] transform-gpu",
        "[border:1px_solid_rgba(255,255,255,.08)]",
        "[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
        "transition-colors duration-300 hover:bg-white/[0.05]",
        className
      )}
    >
      {latar && <div className="absolute inset-0 z-0">{latar}</div>}
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}
