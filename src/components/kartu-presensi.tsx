"use client";

import { useState, useTransition } from "react";
import { LogIn, LogOut, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModalJam, type JenisAksi } from "@/components/modal-jam";
import { ModalUbahJam } from "@/components/modal-ubah-jam";
import {
  aksiCheckIn,
  aksiCheckOut,
  aksiUbahJam,
} from "@/services/presensi-actions";
import type { BarisPresensi } from "@/services/presensi";
import { formatJamWIB } from "@/services/waktu";
import { cn } from "@/lib/utils";

/** ISO → "HH:MM" WIB untuk mengisi <input type="time">. */
function keInputJam(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** Warna status — satu-satunya tempat warna dipakai, sebagai penanda keadaan. */
const WARNA_STATUS: Record<string, string> = {
  hadir: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  telat: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  dinas: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  izin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  alpha: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function KartuPresensi({
  baris,
  jamSekarang,
  rentangCheckin,
  rentangCheckout,
}: {
  baris: BarisPresensi | null;
  /** Jam WIB dihitung di server — jam browser bisa beda zona. */
  jamSekarang: string;
  rentangCheckin: [string, string];
  rentangCheckout: [string, string];
}) {
  const [pending, mulai] = useTransition();
  const [modal, setModal] = useState<JenisAksi | null>(null);
  const [ubah, setUbah] = useState(false);

  const konfirmasi = (jam: string) => {
    const jenis = modal;
    if (!jenis) return;

    mulai(async () => {
      const hasil =
        jenis === "in" ? await aksiCheckIn(jam) : await aksiCheckOut(jam);

      if (hasil.ok) {
        toast.success(hasil.pesan);
        setModal(null); // tutup hanya kalau berhasil
      } else {
        // Gagal → modal tetap terbuka supaya jam bisa dibetulkan tanpa
        // mengulang dari awal.
        toast.error(hasil.pesan);
      }
    });
  };

  const simpanUbahan = (patch: {
    jam_masuk?: string;
    jam_keluar?: string | null;
  }) => {
    if (!baris) return;
    mulai(async () => {
      const hasil = await aksiUbahJam(baris.id, patch);
      if (hasil.ok) {
        toast.success(hasil.pesan);
        setUbah(false);
      } else {
        toast.error(hasil.pesan);
      }
    });
  };

  const sudahMasuk = Boolean(baris?.jam_masuk);
  const sudahKeluar = Boolean(baris?.jam_keluar);

  return (
    <>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Presensi hari ini
            </p>
            {baris ? (
              <span
                className={cn(
                  "mt-2 inline-block rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                  WARNA_STATUS[baris.status] ?? WARNA_STATUS.alpha
                )}
              >
                {baris.status}
              </span>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Belum absen.</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setModal("in")}
              disabled={pending || sudahMasuk}
              title={sudahMasuk ? "Sudah check-in hari ini" : undefined}
            >
              <LogIn />
              Check-in
            </Button>
            <Button
              variant="outline"
              onClick={() => setModal("out")}
              disabled={pending || !sudahMasuk || sudahKeluar}
              title={
                !sudahMasuk
                  ? "Check-in dulu"
                  : sudahKeluar
                  ? "Sudah check-out"
                  : undefined
              }
            >
              <LogOut />
              Check-out
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <div>
            <p className="text-xs text-muted-foreground">Jam masuk</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {formatJamWIB(baris?.jam_masuk)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Jam keluar</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {formatJamWIB(baris?.jam_keluar)}
            </p>
          </div>
        </div>

        {baris && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {baris.jenis?.toUpperCase()}
              {baris.shift ? ` · shift ${baris.shift}` : ""}
              {baris.mood ? ` · mood ${baris.mood}` : ""}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUbah(true)}
              disabled={pending}
            >
              <Pencil />
              Ubah jam
            </Button>
          </div>
        )}
      </div>

      <ModalJam
        buka={modal !== null}
        jenis={modal ?? "in"}
        jamAwal={jamSekarang}
        rentang={modal === "out" ? rentangCheckout : rentangCheckin}
        pending={pending}
        onTutup={() => !pending && setModal(null)}
        onKonfirmasi={konfirmasi}
      />

      <ModalUbahJam
        buka={ubah}
        jamMasukAwal={keInputJam(baris?.jam_masuk)}
        jamKeluarAwal={keInputJam(baris?.jam_keluar)}
        pending={pending}
        onTutup={() => !pending && setUbah(false)}
        onSimpan={simpanUbahan}
      />
    </>
  );
}
