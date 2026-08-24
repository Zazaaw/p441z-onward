import { cn } from "@/lib/utils";

/**
 * Logo typeface "Daily" — mixed-typeface lockup.
 *
 * Namanya dibelah dua: "Dai" memakai sans bold (Plus Jakarta Sans, font
 * badan), "ly" memakai serif italic (PT Serif). Kontras dua rasa huruf dalam
 * satu kata inilah yang jadi bentuk logonya — tidak perlu ikon.
 *
 * Titik belahnya jatuh setelah "Dai" supaya ekor italic mendarat di dua huruf
 * terakhir; membelah di tengah ("Da|ily") membuat bagian italic terlalu
 * dominan dan namanya jadi sulit terbaca sebagai satu kata.
 *
 * Serif-nya Times Ten Italic — font yang sama dengan yang dipakai portfolio,
 * jadi kedua situs berbagi rasa huruf yang identik.
 */
export function LogoDaily({
  className,
  /** Beri nilai bila logo berdiri sendiri tanpa teks pendamping. */
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-baseline tracking-tight",
        className
      )}
      // Dibaca sebagai satu kata utuh oleh pembaca layar, bukan dua potongan.
      role="img"
      aria-label={title ?? "Daily"}
    >
      <span aria-hidden className="font-bold">
        Dai
      </span>
      {/* File fontnya SUDAH italic, jadi jangan tambah class `italic` lagi —
          browser akan memiringkannya sekali lagi secara sintetis dan hasilnya
          terlalu rebah. -ml-[0.03em] merapatkan sambungan, karena huruf
          miring membuka ruang optis di sisi kirinya. */}
      <span
        aria-hidden
        className="-ml-[0.03em] font-[family-name:var(--font-editorial)]"
      >
        ly
      </span>
    </span>
  );
}
