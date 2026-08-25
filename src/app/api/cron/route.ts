import { NextResponse } from "next/server";
import { checkIn, checkOut, cekHariLibur, presensiHariIni } from "@/services/presensi";
import { getPengaturan } from "@/services/pengaturan";
import { catatLog } from "@/services/log";
import { tanggalWIB, hariKerja, jamWIB, keMenit } from "@/services/waktu";

export const dynamic = "force-dynamic";

/**
 * Endpoint otomasi. Dipanggil penjadwal (Vercel Cron / cron-job.org), atau
 * bisa juga dipicu manual untuk mengetes.
 *
 * SATU ENDPOINT UNTUK DUA AKSI: dia memutuskan sendiri harus check-in atau
 * check-out berdasarkan jam sekarang dan kondisi baris hari ini. Alasannya,
 * Vercel Cron paket gratis hanya mengizinkan sedikit jadwal — jadi lebih
 * hemat satu endpoint pintar daripada dua endpoint bodoh.
 *
 * KEAMANAN: wajib membawa header  Authorization: Bearer <CRON_SECRET>
 * Tanpa itu siapa pun yang tahu URL-nya bisa memicu absensimu.
 *
 * Uji manual:
 *   curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron
 *
 * Penjadwalannya lewat GitHub Actions (.github/workflows/cron.yml), bukan
 * Vercel Cron: paket Hobby hanya mengizinkan satu eksekusi per hari,
 * sedangkan presensi butuh dua — check-in pagi dan check-out malam.
 *   tambahkan ?dry=1 untuk melihat keputusannya TANPA menulis apa pun.
 */
export async function GET(req: Request) {
  const rahasia = process.env.CRON_SECRET;

  // Tanpa CRON_SECRET, endpoint ditutup total — lebih aman daripada terbuka.
  if (!rahasia) {
    return NextResponse.json(
      { ok: false, pesan: "CRON_SECRET belum diset di env." },
      { status: 500 }
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${rahasia}`) {
    return NextResponse.json({ ok: false, pesan: "Tidak diizinkan." }, { status: 401 });
  }

  const dry = new URL(req.url).searchParams.get("dry") === "1";
  const p = await getPengaturan();
  const tanggal = tanggalWIB();
  const sekarang = jamWIB();

  const jejak: string[] = [`Waktu WIB ${sekarang}, tanggal ${tanggal}.`];

  // ── Serangkaian syarat. Berhenti di syarat pertama yang gagal. ──
  if (!p.auto_aktif) {
    return NextResponse.json({ ok: true, aksi: "lewat", alasan: "Otomasi dimatikan.", jejak });
  }

  if (p.lewati_akhir_pekan && !hariKerja()) {
    return NextResponse.json({ ok: true, aksi: "lewat", alasan: "Akhir pekan.", jejak });
  }

  if (p.lewati_hari_libur) {
    const libur = await cekHariLibur(tanggal);
    if (libur.libur) {
      return NextResponse.json({
        ok: true,
        aksi: "lewat",
        alasan: `Hari libur: ${libur.nama}.`,
        jejak,
      });
    }
  }

  const baris = await presensiHariIni();
  const menitSekarang = keMenit(sekarang);

  /**
   * Pilih aksi.
   *
   * Aturannya sederhana: kalau belum ada baris DAN sekarang belum lewat jauh
   * dari jendela check-in → check-in. Kalau sudah ada baris tapi belum ada
   * jam keluar DAN sudah masuk jendela check-out → check-out.
   *
   * Batas "belum lewat jauh" = akhir jendela + 2 jam. Supaya cron yang telat
   * jalan (Vercel Cron gratis bisa meleset belasan menit) tetap sempat
   * bekerja, tapi tidak tiba-tiba check-in jam 3 sore.
   */
  const tenggangCheckin = keMenit(p.checkin_selesai) + 120;
  const mulaiCheckout = keMenit(p.checkout_mulai);

  if (!baris) {
    if (!p.auto_checkin) {
      return NextResponse.json({ ok: true, aksi: "lewat", alasan: "Auto check-in dimatikan.", jejak });
    }
    if (menitSekarang > tenggangCheckin) {
      return NextResponse.json({
        ok: true,
        aksi: "lewat",
        alasan: `Sudah lewat tenggang check-in (${p.checkin_selesai} + 2 jam).`,
        jejak,
      });
    }

    if (dry) {
      return NextResponse.json({
        ok: true,
        aksi: "checkin",
        dry: true,
        alasan: `Akan check-in acak antara ${p.checkin_mulai}–${p.checkin_selesai}.`,
        jejak,
      });
    }

    const hasil = await checkIn();
    await catatLog({ aksi: "checkin", sumber: "cron", ok: hasil.ok, pesan: hasil.pesan });
    return NextResponse.json({ ok: hasil.ok, aksi: "checkin", pesan: hasil.pesan, jejak });
  }

  if (!baris.jam_keluar) {
    if (!p.auto_checkout) {
      return NextResponse.json({ ok: true, aksi: "lewat", alasan: "Auto check-out dimatikan.", jejak });
    }
    if (menitSekarang < mulaiCheckout) {
      return NextResponse.json({
        ok: true,
        aksi: "lewat",
        alasan: `Belum masuk jendela check-out (${p.checkout_mulai}).`,
        jejak,
      });
    }

    if (dry) {
      return NextResponse.json({
        ok: true,
        aksi: "checkout",
        dry: true,
        alasan: `Akan check-out acak antara ${p.checkout_mulai}–${p.checkout_selesai}.`,
        jejak,
      });
    }

    const hasil = await checkOut();
    await catatLog({ aksi: "checkout", sumber: "cron", ok: hasil.ok, pesan: hasil.pesan });
    return NextResponse.json({ ok: hasil.ok, aksi: "checkout", pesan: hasil.pesan, jejak });
  }

  return NextResponse.json({
    ok: true,
    aksi: "lewat",
    alasan: "Presensi hari ini sudah lengkap.",
    jejak,
  });
}
