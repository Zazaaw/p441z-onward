import "server-only";

import { ess, MY_NIK } from "./ess-client";
import { tanggalWIB, timestampWIB, jamAcak, keMenit } from "./waktu";
import { getPengaturan } from "./pengaturan";

/**
 * Operasi presensi terhadap tabel `presensi` di ESS-DEV.
 *
 * FAKTA PENTING TENTANG TABEL INI:
 *   - UNIQUE (nik, tanggal) → satu baris per orang per hari.
 *     Maka check-in = INSERT, check-out = UPDATE. Bukan dua insert.
 *   - Ambang telat = 08:00 WIB. Masuk <= 08:00 → 'hadir', lewat → 'telat'.
 *     (Diverifikasi dari data: 'hadir' paling akhir 08:00:16, di atas itu 'telat'.)
 */

export type BarisPresensi = {
  id: number;
  nik: string;
  tanggal: string;
  jam_masuk: string | null;
  jam_keluar: string | null;
  lat_masuk: number | null;
  lng_masuk: number | null;
  lat_keluar: number | null;
  lng_keluar: number | null;
  status: string;
  mood: string | null;
  mood_keluar: string | null;
  face_verified: boolean;
  catatan: string | null;
  jenis: string;
  shift: string | null;
  created_at: string;
};

/** Batas jam masuk sebelum dihitung telat (menit sejak tengah malam). */
const AMBANG_TELAT = keMenit("08:00");

/** Tentukan status dari jam masuk. */
export function statusDariJam(jam: string): "hadir" | "telat" {
  return keMenit(jam) <= AMBANG_TELAT ? "hadir" : "telat";
}

/** Presensi hari ini, atau null kalau belum absen. */
export async function presensiHariIni(): Promise<BarisPresensi | null> {
  const { data, error } = await ess
    .from("presensi")
    .select("*")
    .eq("nik", MY_NIK)
    .eq("tanggal", tanggalWIB())
    .maybeSingle();

  if (error) throw new Error(`Gagal baca presensi hari ini: ${error.message}`);
  return data as BarisPresensi | null;
}

/** Riwayat presensi terbaru. */
export async function riwayatPresensi(batas = 30): Promise<BarisPresensi[]> {
  const { data, error } = await ess
    .from("presensi")
    .select("*")
    .eq("nik", MY_NIK)
    .order("tanggal", { ascending: false })
    .limit(batas);

  if (error) throw new Error(`Gagal baca riwayat: ${error.message}`);
  return (data ?? []) as BarisPresensi[];
}

/** Apakah tanggal ini hari libur nasional / cuti bersama? */
export async function cekHariLibur(
  tanggal: string
): Promise<{ libur: boolean; nama?: string }> {
  const { data, error } = await ess
    .from("hari_libur")
    .select("nama")
    .eq("tgl", tanggal)
    .maybeSingle();

  // Gagal baca tabel libur jangan sampai memblokir presensi — anggap bukan
  // libur, dan biarkan pemanggil yang memutuskan.
  if (error) return { libur: false };
  return data ? { libur: true, nama: data.nama } : { libur: false };
}

export type HasilAksi = {
  ok: boolean;
  pesan: string;
  /** Jam WIB yang dicatat, kalau berhasil. */
  jam?: string;
};

/**
 * CHECK-IN.
 *
 * `jamPaksa` dipakai saat kamu menekan tombol manual dan ingin jam sekarang.
 * Kalau kosong, jam diambil ACAK dari rentang di pengaturan — itu perilaku
 * yang dipakai cron.
 */
export async function checkIn(jamPaksa?: string): Promise<HasilAksi> {
  const tanggal = tanggalWIB();
  const p = await getPengaturan();

  const sudah = await presensiHariIni();
  if (sudah) {
    return {
      ok: false,
      pesan: `Sudah check-in hari ini (${sudah.status}). Satu baris per hari.`,
    };
  }

  const pilih = jamPaksa
    ? { jam: jamPaksa, detik: Math.floor(Math.random() * 60) }
    : jamAcak(p.checkin_mulai, p.checkin_selesai);

  const status = statusDariJam(pilih.jam);

  const { error } = await ess.from("presensi").insert({
    nik: MY_NIK,
    tanggal,
    jam_masuk: timestampWIB(tanggal, pilih.jam, pilih.detik),
    lat_masuk: p.lat,
    lng_masuk: p.lng,
    status,
    mood: p.mood_masuk,
    face_verified: true,
    jenis: p.jenis,
    shift: p.shift,
  });

  if (error) {
    // 23505 = pelanggaran unique. Bisa terjadi kalau cron dan klik manual
    // berbarengan — bukan kesalahan fatal, cukup beri tahu.
    if (error.code === "23505") {
      return { ok: false, pesan: "Sudah ada presensi untuk hari ini." };
    }
    return { ok: false, pesan: `Gagal check-in: ${error.message}` };
  }

  return {
    ok: true,
    pesan: `Check-in tercatat ${pilih.jam} (${status}).`,
    jam: pilih.jam,
  };
}

/**
 * UBAH jam pada baris presensi yang SUDAH ada.
 *
 * Beda dari checkIn/checkOut: ini tidak peduli baris sudah terisi atau belum —
 * memang tugasnya membetulkan. Dipakai kalau salah pilih jam.
 *
 * Status ikut dihitung ulang saat jam masuk berubah, supaya tidak ada baris
 * yang jam masuknya 07:30 tapi statusnya masih 'telat' — itu bakal
 * membingungkan waktu dibaca ulang nanti.
 *
 * Kolom yang tidak disebut TIDAK disentuh (mis. mood, koordinat).
 */
export async function ubahJam(
  id: number,
  patch: { jam_masuk?: string; jam_keluar?: string | null }
): Promise<HasilAksi> {
  const { data: baris, error: errBaca } = await ess
    .from("presensi")
    .select("id, nik, tanggal, jam_masuk")
    .eq("id", id)
    .eq("nik", MY_NIK) // jangan sampai bisa mengubah baris orang lain
    .maybeSingle();

  if (errBaca) return { ok: false, pesan: `Gagal baca baris: ${errBaca.message}` };
  if (!baris) return { ok: false, pesan: "Baris presensi tidak ditemukan." };

  const update: Record<string, unknown> = {};
  const catatan: string[] = [];

  if (patch.jam_masuk) {
    update.jam_masuk = timestampWIB(
      baris.tanggal,
      patch.jam_masuk,
      Math.floor(Math.random() * 60)
    );
    // Jam masuk berubah → status harus ikut, kalau tidak jadi tidak konsisten.
    update.status = statusDariJam(patch.jam_masuk);
    catatan.push(`masuk ${patch.jam_masuk} (${update.status})`);
  }

  if (patch.jam_keluar !== undefined) {
    if (patch.jam_keluar === null) {
      update.jam_keluar = null;
      catatan.push("jam keluar dikosongkan");
    } else {
      update.jam_keluar = timestampWIB(
        baris.tanggal,
        patch.jam_keluar,
        Math.floor(Math.random() * 60)
      );
      catatan.push(`keluar ${patch.jam_keluar}`);
    }
  }

  if (Object.keys(update).length === 0) {
    return { ok: false, pesan: "Tidak ada yang diubah." };
  }

  const { error } = await ess.from("presensi").update(update).eq("id", id);
  if (error) return { ok: false, pesan: `Gagal mengubah: ${error.message}` };

  return { ok: true, pesan: `Diperbarui — ${catatan.join(", ")}.` };
}

/**
 * CHECK-OUT — UPDATE baris hari ini, bukan insert.
 *
 * Hanya mengisi baris yang `jam_keluar`-nya masih kosong. Kalau sudah terisi,
 * tidak ditimpa: catatan yang sudah ada lebih dipercaya daripada tebakan.
 */
export async function checkOut(jamPaksa?: string): Promise<HasilAksi> {
  const tanggal = tanggalWIB();
  const p = await getPengaturan();

  const baris = await presensiHariIni();
  if (!baris) {
    return {
      ok: false,
      pesan: "Belum check-in hari ini, jadi tidak ada yang ditutup.",
    };
  }
  if (baris.jam_keluar) {
    return { ok: false, pesan: "Sudah check-out hari ini." };
  }

  const pilih = jamPaksa
    ? { jam: jamPaksa, detik: Math.floor(Math.random() * 60) }
    : jamAcak(p.checkout_mulai, p.checkout_selesai);

  const { error } = await ess
    .from("presensi")
    .update({
      jam_keluar: timestampWIB(tanggal, pilih.jam, pilih.detik),
      lat_keluar: p.lat,
      lng_keluar: p.lng,
      mood_keluar: p.mood_keluar,
    })
    .eq("id", baris.id)
    // Jaga-jaga kalau ada proses lain menutup duluan di detik yang sama.
    .is("jam_keluar", null);

  if (error) return { ok: false, pesan: `Gagal check-out: ${error.message}` };

  return { ok: true, pesan: `Check-out tercatat ${pilih.jam}.`, jam: pilih.jam };
}
