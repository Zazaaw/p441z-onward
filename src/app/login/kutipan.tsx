import { tanggalWIB } from "@/services/waktu";

/**
 * Kutipan yang berganti tiap hari, sebagai penutup blok tagline.
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
  "Yang penting bukan seberapa cepat, tapi seberapa sering.",
  "Hari biasa yang dijalani terus akan mengalahkan hari luar biasa yang sesekali.",
  "Kemajuan jarang terasa saat dijalani, hanya terlihat saat ditengok.",
  "Cukup lebih baik sedikit dari kemarin. Itu saja.",
  "Konsistensi mengalahkan intensitas.",
  "Langkah kecil tetap langkah.",
  "Muncul dulu, sempurna belakangan.",
];

export function KutipanHarian({ className }: { className?: string }) {
  // Jumlah hari sejak epoch, dipakai sebagai indeks — berganti tepat saat
  // tanggal WIB berganti, bukan saat proses server dimulai.
  const hari = Math.floor(Date.parse(tanggalWIB()) / 86_400_000);
  const kutipan = KUTIPAN[hari % KUTIPAN.length];

  return (
    <p className={className}>
      <span className="font-[family-name:var(--font-editorial)] text-lg leading-snug">
        {kutipan}
      </span>
    </p>
  );
}
