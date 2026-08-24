"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputJam } from "@/components/input-jam";
import { cn } from "@/lib/utils";

/**
 * Modal untuk membetulkan jam pada baris presensi yang sudah tercatat.
 *
 * Beda dari ModalJam (yang membuat catatan baru), ini mengedit yang sudah ada
 * dan menampilkan dua input sekaligus supaya masuk dan keluar bisa dibetulkan
 * dalam satu kali simpan.
 */
export function ModalUbahJam({
  buka,
  jamMasukAwal,
  jamKeluarAwal,
  pending,
  onTutup,
  onSimpan,
}: {
  buka: boolean;
  /** "HH:MM" atau "" kalau kosong. */
  jamMasukAwal: string;
  jamKeluarAwal: string;
  pending: boolean;
  onTutup: () => void;
  onSimpan: (patch: { jam_masuk?: string; jam_keluar?: string | null }) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [masuk, setMasuk] = useState(jamMasukAwal);
  const [keluar, setKeluar] = useState(jamKeluarAwal);

  useEffect(() => {
    if (buka) {
      setMasuk(jamMasukAwal);
      setKeluar(jamKeluarAwal);
    }
  }, [buka, jamMasukAwal, jamKeluarAwal]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (buka && !d.open) d.showModal();
    if (!buka && d.open) d.close();
  }, [buka]);

  const telat = (() => {
    if (!masuk) return false;
    const [h, m] = masuk.split(":").map(Number);
    return h * 60 + m > 8 * 60;
  })();

  // Keluar sebelum masuk — hampir pasti salah ketik, jadi diblokir.
  const urutanSalah = (() => {
    if (!masuk || !keluar) return false;
    const ke = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    return ke(keluar) < ke(masuk);
  })();

  const adaPerubahan = masuk !== jamMasukAwal || keluar !== jamKeluarAwal;

  const simpan = () => {
    const patch: { jam_masuk?: string; jam_keluar?: string | null } = {};
    if (masuk && masuk !== jamMasukAwal) patch.jam_masuk = masuk;
    // String kosong = minta dikosongkan (null). Beda dari "tidak diubah".
    if (keluar !== jamKeluarAwal) patch.jam_keluar = keluar === "" ? null : keluar;
    onSimpan(patch);
  };

  return (
    <dialog
      ref={ref}
      onClose={onTutup}
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
          <Pencil className="size-4" />
          <h2 className="text-base font-semibold">Ubah jam</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Betulkan jam presensi hari ini. Status ikut dihitung ulang.
        </p>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="ubah-masuk" className="text-xs font-medium text-muted-foreground">
              Jam masuk
            </label>
            <InputJam
              id="ubah-masuk"
              value={masuk}
              onChange={setMasuk}
              disabled={pending}
              autoFocus
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="ubah-keluar" className="text-xs font-medium text-muted-foreground">
                Jam keluar
              </label>
              {keluar && (
                <button
                  type="button"
                  onClick={() => setKeluar("")}
                  disabled={pending}
                  className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Eraser className="size-3" />
                  Kosongkan
                </button>
              )}
            </div>
            <InputJam
              id="ubah-keluar"
              value={keluar}
              onChange={setKeluar}
              disabled={pending}
              className="text-lg"
            />
          </div>
        </div>

        {telat && (
          <p className="mt-4 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
            Jam masuk lewat 08:00 — status jadi <strong>telat</strong>.
          </p>
        )}

        {urutanSalah && (
          <p className="mt-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-500">
            Jam keluar lebih awal dari jam masuk.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onTutup} disabled={pending}>
            Batal
          </Button>
          <Button
            type="button"
            onClick={simpan}
            disabled={pending || !adaPerubahan || urutanSalah || !masuk}
          >
            {pending ? <Loader2 className="animate-spin" /> : <Pencil />}
            Simpan
          </Button>
        </div>
      </form>
    </dialog>
  );
}
