import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ZapOff } from "lucide-react";
import BlurFade from "@/components/effects/blur-fade";
import Typography from "@/components/ui/typography";
import { KartuPresensi } from "@/components/kartu-presensi";
import { HeroSapaan } from "@/components/hero-sapaan";
import { SparklinePresensi } from "@/components/sparkline-presensi";
import { NumberTicker } from "@/components/effects/number-ticker";
import {
  presensiHariIni,
  riwayatPresensi,
  cekHariLibur,
  profilSaya,
} from "@/services/presensi";
import { getPengaturan } from "@/services/pengaturan";
import { tanggalWIB, namaHariWIB, formatJamWIB, jamWIB } from "@/services/waktu";

export const metadata: Metadata = { title: "Hari Ini" };

// Selalu ambil data terbaru — presensi berubah sepanjang hari.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const tanggal = tanggalWIB();

  const [baris, riwayat, pengaturan, libur, profil] = await Promise.all([
    presensiHariIni(),
    riwayatPresensi(30),
    getPengaturan(),
    cekHariLibur(tanggal),
    profilSaya(),
  ]);

  // Ringkasan 30 hari terakhir.
  const total = riwayat.length;
  const hadir = riwayat.filter((r) => r.status === "hadir").length;
  const telat = riwayat.filter((r) => r.status === "telat").length;
  const lupaKeluar = riwayat.filter((r) => r.jam_masuk && !r.jam_keluar).length;

  return (
    <BlurFade>
      <HeroSapaan
        profil={profil}
        baris={baris}
        jamSekarang={jamWIB()}
        tanggal={tanggal}
        hari={namaHariWIB()}
        libur={libur}
      />

      <div className="mt-5" />

      <KartuPresensi
        baris={baris}
        jamSekarang={jamWIB()}
        rentangCheckin={[pengaturan.checkin_mulai, pengaturan.checkin_selesai]}
        rentangCheckout={[pengaturan.checkout_mulai, pengaturan.checkout_selesai]}
      />

      {/* Status otomasi */}
      <Link href="/otomasi" className="mt-5 block">
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs transition-all duration-300 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700">
          {pengaturan.auto_aktif ? (
            <Zap className="size-4 shrink-0 text-emerald-500" />
          ) : (
            <ZapOff className="size-4 shrink-0 text-muted-foreground" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">
              Otomasi {pengaturan.auto_aktif ? "aktif" : "nonaktif"}
            </p>
            <p className="text-xs text-muted-foreground">
              {pengaturan.auto_aktif
                ? `Masuk ${pengaturan.checkin_mulai}–${pengaturan.checkin_selesai} · keluar ${pengaturan.checkout_mulai}–${pengaturan.checkout_selesai}`
                : "Klik untuk mengatur jadwal otomatis"}
            </p>
          </div>
        </div>
      </Link>

      <Typography.H4 className="mb-3 mt-10">30 hari terakhir</Typography.H4>
      {/* Satu kartu, bukan empat kotak terpisah — angka dan grafiknya saling
          menjelaskan, jadi lebih baik dibaca sebagai satu kesatuan. */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Statistik label="Tercatat" nilai={total} delay={0} />
          <Statistik label="Hadir" nilai={hadir} warna="text-emerald-500" delay={0.1} />
          <Statistik label="Telat" nilai={telat} warna="text-amber-500" delay={0.2} />
          <Statistik
            label="Lupa check-out"
            nilai={lupaKeluar}
            warna={lupaKeluar > 0 ? "text-red-500" : undefined}
            delay={0.3}
          />
        </div>

        <div className="mt-6 border-t border-neutral-200 pt-5 dark:border-neutral-800">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Pola kehadiran
            </p>
            <p className="text-[11px] text-muted-foreground">
              tinggi = lama kerja · pudar = belum check-out
            </p>
          </div>
          <SparklinePresensi data={riwayat} />
        </div>
      </div>

      <Typography.H4 className="mb-3 mt-10">Presensi terakhir</Typography.H4>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
        {riwayat.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Belum ada data presensi.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {riwayat.slice(0, 7).map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
              >
                <span className="font-medium tabular-nums">{r.tanggal}</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatJamWIB(r.jam_masuk)} – {formatJamWIB(r.jam_keluar)}
                </span>
                <span
                  className={
                    r.status === "hadir"
                      ? "text-emerald-500"
                      : r.status === "telat"
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BlurFade>
  );
}

function Statistik({
  label,
  nilai,
  warna,
  delay,
}: {
  label: string;
  nilai: number;
  warna?: string;
  delay: number;
}) {
  return (
    <div>
      <p className={`text-3xl font-bold tabular-nums ${warna ?? ""}`}>
        <NumberTicker value={nilai} delay={delay} />
      </p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
