"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Input jam 24 tombol.
 *
 * KENAPA TIDAK PAKAI <input type="time">?
 * Karena tampilannya mengikuti locale SISTEM OPERASI, bukan atribut `lang`.
 * Di Windows berbahasa Inggris dia muncul sebagai "01:54 PM" — dan tidak ada
 * cara standar memaksanya jadi 24 jam. Buat alat presensi yang jamnya harus
 * jelas, itu bikin salah baca.
 *
 * Jadi ini input teks biasa dengan pemformatan sendiri:
 *   - hanya menerima angka, titik dua disisipkan otomatis
 *   - selalu "HH:MM" 24 jam
 *   - panah atas/bawah menambah/mengurangi menit (tahan Shift untuk jam)
 *
 * Nilai yang keluar lewat onChange SELALU "HH:MM" atau "" — sama seperti
 * <input type="time">, jadi pemanggil tidak perlu tahu bedanya.
 */
export function InputJam({
  id,
  value,
  onChange,
  disabled,
  autoFocus,
  className,
}: {
  id?: string;
  /** "HH:MM" atau "". */
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}) {
  // State lokal supaya pengguna bisa mengetik setengah jalan ("07:") tanpa
  // langsung dianggap tidak valid oleh induknya.
  const [teks, setTeks] = useState(value);
  const fokus = useRef(false);

  // Ikuti perubahan dari luar, tapi jangan ganggu saat sedang diketik.
  useEffect(() => {
    if (!fokus.current) setTeks(value);
  }, [value]);

  /** Ambil digit, sisipkan ":", batasi jam 0-23 dan menit 0-59. */
  const format = (mentah: string): string => {
    const d = mentah.replace(/\D/g, "").slice(0, 4);
    if (d.length === 0) return "";
    if (d.length <= 2) return d;

    let jam = d.slice(0, 2);
    let menit = d.slice(2);
    if (Number(jam) > 23) jam = "23";
    if (Number(menit) > 59) menit = "59";
    return `${jam}:${menit}`;
  };

  const ketik = (mentah: string) => {
    const hasil = format(mentah);
    setTeks(hasil);
    // Kirim ke atas hanya kalau sudah lengkap; kalau dikosongkan, kirim "".
    if (hasil === "") onChange("");
    else if (/^\d{2}:\d{2}$/.test(hasil)) onChange(hasil);
  };

  /** Saat selesai mengetik, lengkapi input setengah jadi. */
  const rapikan = () => {
    fokus.current = false;
    const d = teks.replace(/\D/g, "");
    if (d.length === 0) {
      setTeks("");
      onChange("");
      return;
    }
    // "7" → "07:00", "730" → "07:30"
    const jam = String(Math.min(23, Number(d.slice(0, 2)))).padStart(2, "0");
    const menit = String(Math.min(59, Number(d.slice(2) || "0"))).padStart(2, "0");
    const hasil = `${jam}:${menit}`;
    setTeks(hasil);
    onChange(hasil);
  };

  /** Panah atas/bawah: ±1 menit, atau ±1 jam kalau menahan Shift. */
  const tombol = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();

    const d = teks.replace(/\D/g, "");
    const total =
      d.length >= 3
        ? Number(d.slice(0, 2)) * 60 + Number(d.slice(2))
        : Number(d || 0) * 60;

    const langkah = e.shiftKey ? 60 : 1;
    const arah = e.key === "ArrowUp" ? 1 : -1;
    // Modulo dua kali supaya hasil negatif ikut berputar ke 23:59.
    const baru = (((total + arah * langkah) % 1440) + 1440) % 1440;

    const hasil = `${String(Math.floor(baru / 60)).padStart(2, "0")}:${String(
      baru % 60
    ).padStart(2, "0")}`;
    setTeks(hasil);
    onChange(hasil);
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="--:--"
        value={teks}
        onChange={(e) => ketik(e.target.value)}
        onFocus={(e) => {
          fokus.current = true;
          e.target.select();
        }}
        onBlur={rapikan}
        onKeyDown={tombol}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label="Jam, format 24 jam"
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-9 text-sm shadow-sm transition-colors",
          "tabular-nums placeholder:text-muted-foreground",
          "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
      <Clock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
