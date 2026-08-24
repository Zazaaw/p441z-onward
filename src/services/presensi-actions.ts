"use server";

import { revalidatePath } from "next/cache";
import { checkIn, checkOut, type HasilAksi } from "./presensi";
import { simpanPengaturan, type Pengaturan } from "./pengaturan";
import { catatLog } from "./log";
import { jamWIB } from "./waktu";

/**
 * Server action yang dipanggil tombol di dashboard.
 *
 * Tombol manual sengaja memakai JAM SEKARANG (bukan jam acak) — kalau kamu
 * menekan tombol, yang jujur adalah waktu saat itu juga. Rentang acak hanya
 * untuk cron.
 */

export async function aksiCheckIn(): Promise<HasilAksi> {
  const hasil = await checkIn(jamWIB());
  await catatLog({
    aksi: "checkin",
    sumber: "manual",
    ok: hasil.ok,
    pesan: hasil.pesan,
  });
  revalidatePath("/dashboard");
  revalidatePath("/riwayat");
  return hasil;
}

export async function aksiCheckOut(): Promise<HasilAksi> {
  const hasil = await checkOut(jamWIB());
  await catatLog({
    aksi: "checkout",
    sumber: "manual",
    ok: hasil.ok,
    pesan: hasil.pesan,
  });
  revalidatePath("/dashboard");
  revalidatePath("/riwayat");
  return hasil;
}

export async function aksiSimpanPengaturan(
  patch: Partial<Pengaturan>
): Promise<{ ok: boolean; pesan: string }> {
  try {
    await simpanPengaturan(patch);
    revalidatePath("/otomasi");
    revalidatePath("/dashboard");
    return { ok: true, pesan: "Pengaturan disimpan." };
  } catch (e) {
    return {
      ok: false,
      pesan: e instanceof Error ? e.message : "Gagal menyimpan.",
    };
  }
}
