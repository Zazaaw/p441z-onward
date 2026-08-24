"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Code2 } from "lucide-react";
import { SiGithub, SiSpotify } from "react-icons/si";
import { JamHidup } from "@/components/jam-hidup";
import { KontribusiGrid } from "@/components/kontribusi-grid";
import type { Kontribusi, Lagu, Waka } from "@/services/portfolio";

/**
 * Panel bermerek di sisi kanan — mengikuti pola auth showcase di portfolio:
 * kartu rounded penuh dengan margin, foto Satu Visual berganti otomatis
 * sebagai latar, logo di atas, headline besar di bawah, lalu satu kartu kaca.
 *
 * Isinya disesuaikan: kartu kacanya memuat jejak digital (kontribusi, jam
 * ngoding, lagu) alih-alih testimoni klien.
 */
export function Showcase({
  foto,
  nama,
  jamAwal,
  hari,
  tanggal,
  fotoShowcase = [],
  github,
  waka,
  lagu,
}: {
  foto?: string | null;
  nama: string;
  jamAwal: string;
  hari: string;
  tanggal: string;
  fotoShowcase?: string[];
  github: Kontribusi | null;
  waka: Waka | null;
  lagu: Lagu | null;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (fotoShowcase.length < 2) return;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % fotoShowcase.length),
      5000
    );
    return () => clearInterval(t);
  }, [fotoShowcase.length]);

  return (
    <div className="relative h-full min-h-[calc(100dvh-2rem)] w-full overflow-hidden rounded-[2rem] bg-neutral-950">
      {/* Foto saling silang-pudar */}
      {fotoShowcase.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="50vw"
          // Hanya foto pertama yang diprioritaskan; sisanya menyusul agar
          // tidak menahan render awal halaman login.
          priority={i === 0}
          className="object-cover transition-opacity duration-1000"
          style={{ opacity: i === idx ? 1 : 0 }}
        />
      ))}

      {/* Peredup — cukup untuk keterbacaan, tidak sampai memadamkan foto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
      <div className="absolute -right-24 -top-24 size-72 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between p-10 lg:p-12">
        {/* ── Atas: identitas + titik slide ────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-white">
            <div className="relative size-7 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
              {foto ? (
                <Image
                  src={foto}
                  alt={nama}
                  fill
                  sizes="28px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-white/10 text-[10px] font-bold">
                  FH
                </span>
              )}
            </div>
            <span className="text-sm font-semibold tracking-wide">{nama}</span>
          </div>

          {fotoShowcase.length > 1 ? (
            <div className="flex gap-1.5">
              {fotoShowcase.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full bg-white transition-all duration-500"
                  style={{ width: i === idx ? 20 : 6, opacity: i === idx ? 1 : 0.4 }}
                />
              ))}
            </div>
          ) : (
            // Tanpa foto, titik slide tidak ada gunanya — jam yang mengisi.
            <span className="text-sm font-medium tabular-nums text-white/70">
              <JamHidup jamAwal={jamAwal} />
              <span className="ml-1.5 text-white/40">WIB</span>
            </span>
          )}
        </div>

        {/* ── Bawah: headline + kartu kaca ─────────────────────────────── */}
        <div className="flex flex-col gap-8">
          <div className="max-w-lg">
            {/* Jam jadi headline — untuk aplikasi presensi, waktu berjalan
                lebih hidup daripada kalimat sambutan yang statis. */}
            <p className="text-sm text-white/60">{hari}, {tanggal}</p>
            <h2 className="mt-2 text-[clamp(3.5rem,7vw,5.5rem)] font-bold leading-[0.9] tracking-tighter tabular-nums text-white">
              <JamHidup jamAwal={jamAwal} />
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/80">
              Catat kehadiran, pantau rekap, semuanya di satu tempat.
            </p>
          </div>

          {/* Kartu kaca — sejajar dengan kartu testimoni di portfolio, tapi
              isinya jejak digital yang datanya memang kita punya. */}
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
              {github && (
                <Angka
                  ikon={<SiGithub className="size-3.5" />}
                  nilai={github.total.toLocaleString("id-ID")}
                  label="kontribusi setahun"
                />
              )}
              {waka && (
                <Angka
                  ikon={<Code2 className="size-3.5" />}
                  nilai={waka.total.replace(" hrs", "j").replace(" mins", "m")}
                  label={
                    waka.bahasa[0]
                      ? `${waka.bahasa[0].nama} ${Math.round(waka.bahasa[0].persen)}%`
                      : "total ngoding"
                  }
                />
              )}
            </div>

            {github && (
              <div className="mt-5 border-t border-white/10 pt-5 text-white">
                <KontribusiGrid data={github} minggu={26} />
              </div>
            )}

            {lagu && (
              <div className="mt-5 flex items-center gap-2.5 border-t border-white/10 pt-5">
                <SiSpotify className="size-4 shrink-0 text-[#1DB954]" />
                <p className="min-w-0 flex-1 truncate text-sm text-white/70">
                  <span className="font-medium text-white/90">{lagu.judul}</span>
                  <span className="mx-1.5 text-white/30">·</span>
                  {lagu.artis}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Angka({
  ikon,
  nilai,
  label,
}: {
  ikon: React.ReactNode;
  nilai: string;
  label: string;
}) {
  return (
    <div>
      <p className="text-2xl font-bold leading-none tracking-tight tabular-nums text-white">
        {nilai}
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/60">
        {ikon}
        {label}
      </p>
    </div>
  );
}
