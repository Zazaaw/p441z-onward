import Image from "next/image";
import { Music } from "lucide-react";
import { SiSpotify } from "react-icons/si";
import type { Lagu } from "@/services/portfolio";

/**
 * Kartu "sedang diputar" — data dari Last.fm, tampilan bergaya Spotify.
 *
 * Last.fm men-scrobble putaran Spotify dan API-nya gratis, sementara endpoint
 * playback Spotify sendiri butuh akun Premium. Jadi tampilannya Spotify,
 * sumbernya Last.fm.
 *
 * Kalau lagunya tidak sedang diputar, kartu tetap tampil sebagai "terakhir
 * diputar" — lebih hidup daripada kartu kosong.
 */
export function NowPlaying({ lagu }: { lagu: Lagu }) {
  const isi = (
    <div className="flex items-center gap-3">
      <div className="relative size-10 shrink-0 overflow-hidden rounded bg-white/10">
        {lagu.gambar ? (
          <Image
            src={lagu.gambar}
            alt=""
            fill
            sizes="40px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="flex size-full items-center justify-center">
            <Music className="size-4 text-white/40" />
          </span>
        )}

        {/* Lencana Spotify di pojok sampul — putarannya memang dari Spotify,
            Last.fm cuma perantara datanya (API playback Spotify butuh Premium). */}
        <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-neutral-950 p-[3px]">
          <SiSpotify className="size-3 text-[#1DB954]" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {lagu.sedangDiputar ? (
            // Tiga batang bergerak — penanda "sedang berbunyi" yang langsung
            // dikenali, tanpa perlu tulisan.
            <span className="flex h-2.5 items-end gap-[2px]" aria-hidden="true">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  style={{ animationDelay: `${d}ms` }}
                  className="w-[2px] animate-[bar_900ms_ease-in-out_infinite] bg-emerald-400"
                />
              ))}
            </span>
          ) : null}
          <p className="truncate text-[13px] font-medium text-white/90">
            {lagu.judul}
          </p>
        </div>
        <p className="truncate text-[11px] text-white/45">{lagu.artis}</p>
      </div>
    </div>
  );

  if (!lagu.url) return isi;

  return (
    <a
      href={lagu.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg transition-opacity hover:opacity-80"
    >
      {isi}
    </a>
  );
}
