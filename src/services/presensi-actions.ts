"use server";

import { revalidatePath } from "next/cache";
import { checkIn, checkOut, type HasilAksi } from "./presensi";
import { simpanPengaturan, type Pengaturan } from "./pengaturan";
import { catatLog } from "./log";
import { jamWIB } from "./waktu";

/**
 * Server action yang dipanggil tombol di dashboard.
 *
 * `jam` opsional, format "HH:MM". Kalau tidak diisi, dipakai jam sekarang —
 * jadi pemanggil lama tetap jalan. Modal pemilih jam mengirim nilai eksplisit.
 */

/**
 * Terima hanya "HH:MM" 24 jam yang benar-benar valid.
 *
 * Validasi dilakukan di SERVER, bukan cuma di input HTML. `<input type="time">`
 * gampang diakali lewat devtools, dan nilai ngawur di sini akan menghasilkan
 * timestamp "Invalid Date" yang diam-diam masuk database.
 */
function jamValid(jam: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(jam);
}

export async function aksiCheckIn(jam?: string): Promise<HasilAksi> {
  if (jam && !jamValid(jam)) {
    return { ok: false, pesan: "Format jam tidak valid. Pakai HH:MM." };
  }

  const dipakai = jam ?? jamWIB();
  const hasil = await checkIn(dipakai);

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

export async function aksiCheckOut(jam?: string): Promise<HasilAksi> {
  if (jam && !jamValid(jam)) {
    return { ok: false, pesan: "Format jam tidak valid. Pakai HH:MM." };
  }

  const dipakai = jam ?? jamWIB();
  const hasil = await checkOut(dipakai);

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
