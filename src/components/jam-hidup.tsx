"use client";

import { useEffect, useState } from "react";

/**
 * Jam WIB yang berdetak tiap detik.
 *
 * KENAPA `jamAwal` DIPERLUKAN?
 * Server merender jam pertama, lalu klien mengambil alih. Kalau komponen ini
 * langsung menghitung sendiri saat render pertama, HTML server dan klien akan
 * berbeda dan React melempar peringatan hydration. Jadi render pertama WAJIB
 * memakai nilai dari server, dan detik baru mulai setelah mount.
 *
 * Zona dikunci ke Asia/Jakarta — bukan zona perangkat — supaya jam yang
 * tampil selalu sama dengan jam yang dicatat ke database.
 */
export function JamHidup({ jamAwal }: { jamAwal: string }) {
  const [jam, setJam] = useState(jamAwal);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const tik = () => setJam(fmt.format(new Date()));
    tik(); // langsung sinkron, jangan tunggu satu detik

    // Selaraskan ke pergantian detik supaya menit berganti tepat waktu,
    // bukan meleset sampai satu detik.
    const keDetikBerikut = 1000 - (Date.now() % 1000);
    let interval: ReturnType<typeof setInterval>;
    const awal = setTimeout(() => {
      tik();
      interval = setInterval(tik, 1000);
    }, keDetikBerikut);

    return () => {
      clearTimeout(awal);
      clearInterval(interval);
    };
  }, []);

  return (
    <span suppressHydrationWarning className="tabular-nums">
      {jam}
    </span>
  );
}
