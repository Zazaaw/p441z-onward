import { cn } from "@/lib/utils";

/**
 * Logo "Daily" — dua bentuk, satu keluarga rasa huruf.
 *
 * Keduanya memakai mixed-typeface lockup: sans bold (Plus Jakarta Sans)
 * disandingkan serif italic (Times Ten). Kontras dua rasa huruf itulah yang
 * jadi bentuk logonya — tidak perlu ikon.
 */

/**
 * Bentuk panjang — tagline dua baris, untuk layar login dan tempat lain yang
 * punya ruang lega.
 *
 * Dulu tiga baris ("one day / better than / before."), tapi jadi terlalu
 * menjulang ke bawah dan memaksa ukurannya dikecilkan. Dipadatkan jadi dua
 * baris supaya hurufnya bisa jauh lebih besar tanpa menambah tinggi.
 *
 * Leading 0.82 membuat kedua baris saling mengunci jadi satu bentuk, bukan
 * dua kalimat terpisah. "better" dibesarkan 1.45em karena kata italic di
 * lockup seperti ini memang harus mendominasi — kalau seukuran sisanya, ia
 * cuma terlihat seperti salah ketik.
 */
export function LogoDailyPanjang({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block select-none text-left leading-[0.82] tracking-tighter",
        className
      )}
      role="img"
      aria-label="one day better"
    >
      <span aria-hidden className="block font-bold">
        one day
      </span>
      <span
        aria-hidden
        className="block font-[family-name:var(--font-editorial)] text-[1.45em] leading-[0.78]"
      >
        better
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
