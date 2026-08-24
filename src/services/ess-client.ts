import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Klien ke database ESS-DEV (AGHRIS) — sumber data presensi sebenarnya.
 *
 * ⚠️  SERVICE ROLE KEY. Kunci ini melewati SEMUA Row Level Security.
 *     `import "server-only"` di atas membuat build GAGAL kalau file ini
 *     sampai ter-import dari komponen klien — pengaman supaya kunci tidak
 *     pernah bocor ke browser.
 *
 *     Jangan pernah menamai variabelnya dengan awalan NEXT_PUBLIC_.
 */

const url = process.env.NEXT_PUBLIC_ESS_SUPABASE_URL;
const serviceKey = process.env.ESS_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "ESS env belum lengkap. Butuh NEXT_PUBLIC_ESS_SUPABASE_URL dan ESS_SUPABASE_SERVICE_ROLE_KEY di .env.local"
  );
}

export const ess = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** NIK pemilik dashboard ini. Semua operasi presensi terikat ke NIK ini. */
export const MY_NIK = process.env.ESS_MY_NIK ?? "3028226";
