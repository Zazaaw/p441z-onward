"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, LogIn, LogOut, Shuffle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type JenisAksi = "in" | "out";

/**
 * Modal pemilih jam untuk check-in / check-out manual.
 *
 * Dibangun dari <dialog> bawaan browser, bukan library. Alasannya: elemen ini
 * sudah memberi focus trap, tutup dengan Esc, dan backdrop secara gratis —
 * tiga hal yang biasanya jadi sumber bug kalau ditulis sendiri.
 */
export function ModalJam({
  buka,
  jenis,
  jamAwal,
  rentang,
  pending,
  onTutup,
  onKonfirmasi,
}: {
  buka: boolean;
  jenis: JenisAksi;
  /** Jam sekarang (WIB), dipakai sebagai nilai awal. */
  jamAwal: string;
  /** Rentang acak dari pengaturan otomasi: [mulai, selesai]. */
  rentang: [string, string];
  pending: boolean;
  onTutup: () => void;
  onKonfirmasi: (jam: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [jam, setJam] = useState(jamAwal);

  // Setiap dibuka, reset ke jam sekarang — supaya tidak menyimpan sisa
  // pilihan sebelumnya yang sudah basi.
  useEffect(() => {
    if (buka) setJam(jamAwal);
  }, [buka, jamAwal]);

  // Sinkronkan state React dengan API <dialog>.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (buka && !d.open) d.showModal();
    if (!buka && d.open) d.close();
  }, [buka]);

  const judul = jenis === "in" ? "Check-in" : "Check-out";
  const Ikon = jenis === "in" ? LogIn : LogOut;

  /** Ambil satu jam acak dalam rentang otomasi. */
  const acak = () => {
    const [a, b] = rentang.map((t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    });
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const menit = lo + Math.floor(Math.random() * (hi - lo + 1));
    const h = String(Math.floor(menit / 60) % 24).padStart(2, "0");
    const m = String(menit % 60).padStart(2, "0");
    setJam(`${h}:${m}`);
  };

  // Peringatan telat hanya relevan untuk check-in.
  const telat =
    jenis === "in" &&
    (() => {
      const [h, m] = jam.split(":").map(Number);
      return h * 60 + m > 8 * 60;
    })();

  return (
    <dialog
      ref={ref}
      onClose={onTutup}
      // Klik di area backdrop (di luar kartu) menutup modal.
      onClick={(e) => {
        if (e.target === ref.current) onTutup();
      }}
      className={cn(
        "w-[92vw] max-w-sm rounded-xl border border-neutral-200 bg-white p-0 text-foreground shadow-xs backdrop:bg-black/50",
        "dark:border-neutral-800 dark:bg-neutral-900",
        "open:animate-in open:fade-in-0 open:zoom-in-95"
      )}
    >
      <form method="dialog" onSubmit={(e) => e.preventDefault()} className="p-6">
        <div className="flex items-center gap-2">
          <Ikon className="size-4" />
          <h2 className="text-base font-semibold">{judul}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih jam yang mau dicatat. Default jam sekarang.
        </p>

        <div className="mt-5 space-y-2">
          <label htmlFor="jam" className="text-xs font-medium text-muted-foreground">
            Jam (WIB)
          </label>
          <Input
            id="jam"
            type="time"
            value={jam}
            onChange={(e) => setJam(e.target.value)}
            disabled={pending}
            autoFocus
            className="text-lg tabular-nums"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setJam(jamAwal)}
            disabled={pending}
          >
            <Clock />
            Sekarang
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={acak}
            disabled={pending}
            title={`Acak antara ${rentang[0]}–${rentang[1]}`}
          >
            <Shuffle />
            Acak ({rentang[0]}–{rentang[1]})
          </Button>
        </div>

        {telat && (
          <p className="mt-4 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
            Lewat 08:00 — akan tercatat sebagai <strong>telat</strong>.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onTutup}
            disabled={pending}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={() => onKonfirmasi(jam)}
            disabled={pending || !jam}
          >
            {pending ? <Loader2 className="animate-spin" /> : <Ikon />}
            {judul} {jam}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
