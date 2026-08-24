"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aksiSimpanPengaturan } from "@/services/presensi-actions";
import type { Pengaturan } from "@/services/pengaturan";
import { cn } from "@/lib/utils";

export function FormOtomasi({ awal }: { awal: Pengaturan }) {
  const [p, setP] = useState<Pengaturan>(awal);
  const [pending, mulai] = useTransition();

  const ubah = <K extends keyof Pengaturan>(k: K, v: Pengaturan[K]) =>
    setP((s) => ({ ...s, [k]: v }));

  const simpan = () =>
    mulai(async () => {
      const hasil = await aksiSimpanPengaturan(p);
      if (hasil.ok) toast.success(hasil.pesan);
      else toast.error(hasil.pesan);
    });

  return (
    <div className="space-y-5">
      {/* Saklar utama */}
      <Kartu>
        <Saklar
          label="Otomasi aktif"
          keterangan="Saklar utama. Kalau mati, penjadwal tidak melakukan apa pun."
          nilai={p.auto_aktif}
          onUbah={(v) => ubah("auto_aktif", v)}
        />
      </Kartu>

      {/* Check-in */}
      <Kartu judul="Check-in otomatis">
        <Saklar
          label="Aktifkan check-in otomatis"
          nilai={p.auto_checkin}
          onUbah={(v) => ubah("auto_checkin", v)}
        />
        <RentangJam
          mulai={p.checkin_mulai}
          selesai={p.checkin_selesai}
          onMulai={(v) => ubah("checkin_mulai", v)}
          onSelesai={(v) => ubah("checkin_selesai", v)}
        />
        <p className="text-xs text-muted-foreground">
          Jam dipilih acak dalam rentang ini. Masuk sampai 08:00 dihitung{" "}
          <span className="text-emerald-500">hadir</span>, lewat itu{" "}
          <span className="text-amber-500">telat</span>.
        </p>
      </Kartu>

      {/* Check-out */}
      <Kartu judul="Check-out otomatis">
        <Saklar
          label="Aktifkan check-out otomatis"
          nilai={p.auto_checkout}
          onUbah={(v) => ubah("auto_checkout", v)}
        />
        <RentangJam
          mulai={p.checkout_mulai}
          selesai={p.checkout_selesai}
          onMulai={(v) => ubah("checkout_mulai", v)}
          onSelesai={(v) => ubah("checkout_selesai", v)}
        />
        <p className="text-xs text-muted-foreground">
          Hanya menutup baris yang jam keluarnya masih kosong. Yang sudah
          terisi tidak akan ditimpa.
        </p>
      </Kartu>

      {/* Pengecualian */}
      <Kartu judul="Pengecualian">
        <Saklar
          label="Lewati Sabtu & Minggu"
          nilai={p.lewati_akhir_pekan}
          onUbah={(v) => ubah("lewati_akhir_pekan", v)}
        />
        <Saklar
          label="Lewati hari libur nasional"
          keterangan="Dibaca dari tabel hari_libur di ESS."
          nilai={p.lewati_hari_libur}
          onUbah={(v) => ubah("lewati_hari_libur", v)}
        />
      </Kartu>

      {/* Detail baris */}
      <Kartu judul="Detail yang dicatat">
        <div className="grid gap-4 sm:grid-cols-2">
          <Medan label="Latitude">
            <Input
              type="number"
              step="0.0001"
              value={p.lat}
              onChange={(e) => ubah("lat", Number(e.target.value))}
            />
          </Medan>
          <Medan label="Longitude">
            <Input
              type="number"
              step="0.0001"
              value={p.lng}
              onChange={(e) => ubah("lng", Number(e.target.value))}
            />
          </Medan>
          <Medan label="Jenis">
            <Input value={p.jenis} onChange={(e) => ubah("jenis", e.target.value)} />
          </Medan>
          <Medan label="Shift">
            <Input value={p.shift} onChange={(e) => ubah("shift", e.target.value)} />
          </Medan>
          <Medan label="Mood masuk">
            <Input
              value={p.mood_masuk}
              onChange={(e) => ubah("mood_masuk", e.target.value)}
            />
          </Medan>
          <Medan label="Mood keluar">
            <Input
              value={p.mood_keluar}
              onChange={(e) => ubah("mood_keluar", e.target.value)}
            />
          </Medan>
        </div>
      </Kartu>

      <Button onClick={simpan} disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Save />}
        Simpan pengaturan
      </Button>
    </div>
  );
}

/* ── potongan UI kecil ── */

function Kartu({
  judul,
  children,
}: {
  judul?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
      {judul && <p className="text-sm font-semibold">{judul}</p>}
      {children}
    </div>
  );
}

function Saklar({
  label,
  keterangan,
  nilai,
  onUbah,
}: {
  label: string;
  keterangan?: string;
  nilai: boolean;
  onUbah: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="text-sm font-medium">{label}</span>
        {keterangan && (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {keterangan}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={nilai}
        onClick={() => onUbah(!nilai)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          nilai ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
            nilai ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}

function RentangJam({
  mulai,
  selesai,
  onMulai,
  onSelesai,
}: {
  mulai: string;
  selesai: string;
  onMulai: (v: string) => void;
  onSelesai: (v: string) => void;
}) {
  return (
    <div className="flex items-end gap-3">
      <Medan label="Dari">
        <Input type="time" value={mulai} onChange={(e) => onMulai(e.target.value)} />
      </Medan>
      <span className="pb-2 text-muted-foreground">–</span>
      <Medan label="Sampai">
        <Input
          type="time"
          value={selesai}
          onChange={(e) => onSelesai(e.target.value)}
        />
      </Medan>
    </div>
  );
}

function Medan({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-2">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
