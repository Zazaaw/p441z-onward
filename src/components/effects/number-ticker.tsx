"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * NumberTicker — angka menghitung naik saat masuk viewport.
 *
 * Memakai spring, bukan durasi tetap, supaya perhitungannya melambat di
 * ujung — terasa seperti berhenti sendiri, bukan dipotong.
 *
 * Angka di-render lewat ref (bukan state) agar tiap frame animasi tidak
 * memicu re-render React. Untuk empat angka sekaligus, itu bedanya cukup
 * terasa.
 */
export function NumberTicker({
  value,
  delay = 0,
  className,
}: {
  value: number;
  /** Detik sebelum mulai — dipakai untuk stagger antar kartu. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const inView = useInView(ref, { once: true, margin: "0px" });
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      motionValue.set(value);
      setSiap(true);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [inView, value, delay, motionValue]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("id-ID").format(
          Math.round(v)
        );
      }
    });
  }, [spring]);

  return (
    <span
      ref={ref}
      className={cn("inline-block tabular-nums", className)}
      // Nilai awal "0" supaya tidak kosong sebelum animasi jalan, dan tetap
      // terbaca kalau JavaScript mati.
    >
      {siap ? undefined : 0}
    </span>
  );
}

export default NumberTicker;
