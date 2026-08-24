"use client";

import { useState, useTransition } from "react";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { aksiCheckIn, aksiCheckOut } from "@/services/presensi-actions";
import type { BarisPresensi } from "@/services/presensi";
import { formatJamWIB } from "@/services/waktu";
import { cn } from "@/lib/utils";

/** Warna status — satu-satunya tempat warna dipakai, sebagai penanda keadaan. */
const WARNA_STATUS: Record<string, string> = {
  hadir: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  telat: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  dinas: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  izin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  alpha: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function KartuPresensi({ baris }: { baris: BarisPresensi | null }) {
  const [pending, mulai] = useTransition();
  const [aksiJalan, setAksiJalan] = useState<"in" | "out" | null>(null);

  const jalankan = (jenis: "in" | "out") => {
    setAksiJalan(jenis);
    mulai(async () => {
      const hasil = jenis === "in" ? await aksiCheckIn() : await aksiCheckOut();
      if (hasil.ok) toast.success(hasil.pesan);
      else toast.error(hasil.pesan);
      setAksiJalan(null);
    });
  };

  const sudahMasuk = Boolean(baris?.jam_masuk);
  const sudahKeluar = Boolean(baris?.jam_keluar);

  return (
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
            onClick={() => jalankan("in")}
            disabled={pending || sudahMasuk}
            title={sudahMasuk ? "Sudah check-in hari ini" : undefined}
          >
            {pending && aksiJalan === "in" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogIn />
            )}
            Check-in
          </Button>
          <Button
            variant="outline"
            onClick={() => jalankan("out")}
            disabled={pending || !sudahMasuk || sudahKeluar}
            title={
              !sudahMasuk
                ? "Check-in dulu"
                : sudahKeluar
                ? "Sudah check-out"
                : undefined
            }
          >
            {pending && aksiJalan === "out" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogOut />
            )}
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
        <p className="mt-4 text-xs text-muted-foreground">
          {baris.jenis?.toUpperCase()}
          {baris.shift ? ` · shift ${baris.shift}` : ""}
          {baris.mood ? ` · mood ${baris.mood}` : ""}
        </p>
      )}
    </div>
  );
}
