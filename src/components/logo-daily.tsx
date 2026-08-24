import { cn } from "@/lib/utils";

/**
 * Logo "Daily" — dua bentuk, satu keluarga rasa huruf.
 *
 * Keduanya memakai mixed-typeface lockup: sans bold (Plus Jakarta Sans)
 * disandingkan serif italic (Times Ten). Kontras dua rasa huruf itulah yang
 * jadi bentuk logonya — tidak perlu ikon.
 */

/**
 * Bentuk panjang — tagline tiga baris, untuk layar login dan tempat lain yang
 * punya ruang lega.
 *
 * Ditulis sebagai blok tiga baris dengan leading sangat rapat (0.85) supaya
 * barisnya saling mengunci jadi satu bentuk, bukan tiga kalimat terpisah.
 * "better" dibuat lebih besar dari baris lain: di lockup seperti ini kata
 * italic-nya memang harus menonjol, kalau seukuran sisanya dia cuma terlihat
 * seperti salah ketik.
 */
export function LogoDailyPanjang({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block select-none text-left leading-[0.85] tracking-tight",
        className
      )}
      role="img"
      aria-label="one day better than before"
    >
      <span aria-hidden className="block font-bold">
        one day
      </span>
      {/* Baris tengah: italic mendominasi, "than" mengekor kecil di sisinya —
          persis pola referensi, di mana kata kunci membesar dan kata
          sambungnya menyusut. */}
      <span aria-hidden className="block whitespace-nowrap">
        <span className="font-[family-name:var(--font-editorial)] text-[1.5em] leading-[0.8]">
          better
        </span>
        {/* -ml-[0.06em]: ekor huruf italic menjorok ke kanan, jadi jarak
            optisnya sudah terisi — tanpa koreksi ini "than" terlihat jauh. */}
        <span className="-ml-[0.06em] font-bold">than</span>
      </span>
      <span aria-hidden className="block font-bold">
        before.
      </span>
    </span>
  );
}

/**
 * Bentuk pendek — satu kata, untuk header, sidebar, dan ruang sempit.
 *
 * Belahannya jatuh setelah "Dai" supaya ekor italic mendarat di dua huruf
 * terakhir; membelah di tengah ("Da|ily") membuat bagian italic terlalu
 * dominan dan namanya sulit terbaca sebagai satu kata.
 */
export function LogoDaily({
  className,
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
      role="img"
      aria-label={title ?? "Daily"}
    >
      <span aria-hidden className="font-bold">
        Dai
      </span>
      {/* File fontnya SUDAH italic, jadi jangan tambah class `italic` lagi —
          browser akan memiringkannya sekali lagi secara sintetis dan hasilnya
          terlalu rebah. */}
      <span
        aria-hidden
        className="-ml-[0.03em] font-[family-name:var(--font-editorial)]"
      >
        ly
      </span>
    </span>
  );
}
