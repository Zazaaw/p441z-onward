import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Klien ke Supabase portfolio — tempat menyimpan state milik aplikasi ini
 * sendiri (pengaturan otomasi dan riwayat eksekusi).
 *
 * KENAPA DATABASE, BUKAN FILE LAGI?
 * Sebelumnya keduanya disimpan sebagai berkas JSON di `data/`. Itu jalan
 * mulus di laptop dan gagal total di Vercel, yang filesystem-nya read-only.
 * Akibatnya cron tampak sehat — Actions hijau, HTTP 200 — padahal pengaturan
 * selalu jatuh ke bawaan `auto_aktif: false`, jadi tidak pernah melakukan
 * apa pun. Menyamakan penyimpanan dev dan produksi menghapus seluruh kelas
 * kegagalan itu.
 *
 * KENAPA DATABASE PORTFOLIO, BUKAN ESS-DEV?
 * ESS-DEV milik kantor. Preferensi pribadi tidak pantas menumpang di sana.
 *
 * ⚠️  SERVICE ROLE KEY — melewati semua Row Level Security. `server-only`
 *     di atas membuat build GAGAL bila file ini ter-import dari komponen
 *     klien. Jangan pernah diberi awalan NEXT_PUBLIC_.
 */

const url = process.env.PORTFOLIO_SUPABASE_URL;
const serviceKey = process.env.PORTFOLIO_SUPABASE_SERVICE_ROLE_KEY;

/**
 * Sengaja null (bukan melempar saat import) bila env belum lengkap.
 *
 * Melempar di sini akan menjatuhkan SELURUH aplikasi — termasuk halaman
 * login dan dashboard yang sebenarnya tidak butuh penyimpanan ini. Yang
 * dipakai gantinya: pembaca jatuh ke nilai bawaan, penulis melempar galat
 * yang jelas. Jadi bagian yang terdampak saja yang berhenti, dan sebabnya
 * terbaca.
 */
export const simpanan =
  url && serviceKey
    ? createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

/** Pesan seragam supaya penyebabnya tidak perlu ditebak dari stack trace. */
export const PESAN_BELUM_DISETEL =
  "Penyimpanan belum disetel. Butuh PORTFOLIO_SUPABASE_URL dan PORTFOLIO_SUPABASE_SERVICE_ROLE_KEY di env.";
