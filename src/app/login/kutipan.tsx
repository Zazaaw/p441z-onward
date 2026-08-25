import { tanggalWIB } from "@/services/waktu";

/**
 * Kalimat yang berganti tiap hari, sebagai penutup blok tagline.
 *
 * Sengaja BUKAN data presensi: apa pun yang bersumber dari akun akan bocor
 * ke siapa saja yang membuka halaman login, padahal belum ada yang
 * terautentikasi. Kutipan tidak punya masalah itu, dan tetap membuat sisi
 * kiri terasa hidup.
 *
 * Dipilih dari tanggal, bukan acak — supaya server dan browser menghasilkan
 * kutipan yang sama. Math.random() di sini akan memicu hydration mismatch.
 */
const KUTIPAN = [
  "Bukan soal seberapa cepat, tapi seberapa sering kamu kembali.",
  "Hari yang biasa saja, dijalani terus, mengalahkan hari luar biasa yang sesekali.",
  "Kemajuan jarang terasa saat dijalani — baru terlihat saat ditengok.",
  "Tidak perlu jadi hebat hari ini. Cukup lebih baik sedikit dari kemarin.",
  "Yang membentukmu bukan hari besarnya, tapi hari-hari kecil di antaranya.",
  "Datang dulu, sempurna belakangan.",
  "Pelan bukan berarti berhenti.",
]

export function KutipanHarian({ className }: { className?: string }) {
  // Jumlah hari sejak epoch, dipakai sebagai indeks — berganti tepat saat
  // tanggal WIB berganti, bukan saat proses server dimulai.
  const hari = Math.floor(Date.parse(tanggalWIB()) / 86_400_000);
  const kutipan = KUTIPAN[hari % KUTIPAN.length];

  return (
    // Sans, bukan serif: Times Ten sudah dipakai di tagline tepat di atas
    // baris ini, dan dua elemen serif berurutan membuat keduanya saling
    // meredam. Sans di sini justru menegaskan tagline sebagai satu-satunya
    // aksen editorial.
    <p className={className}>{kutipan}</p>
  );
}
