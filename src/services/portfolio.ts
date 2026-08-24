import "server-only";

/**
 * Data "sisi personal" untuk halaman login — GitHub, WakaTime, Last.fm.
 *
 * PRINSIP DI FILE INI: tidak ada satu pun kegagalan yang boleh membuat
 * halaman login gagal render. Setiap fungsi mengembalikan `null` kalau
 * env-nya kosong atau API-nya bermasalah, dan pemanggil menyembunyikan
 * bagian itu. Lebih baik satu blok hilang daripada orang tidak bisa masuk.
 *
 * Semua fetch di-cache singkat: halaman ini bisa dibuka berkali-kali, tidak
 * perlu menembak API pihak ketiga tiap kali.
 */

/* ── GitHub: kalender kontribusi ─────────────────────────────────────── */

const GITHUB_ENDPOINT = "https://api.github.com/graphql";

const GITHUB_QUERY = `query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { contributionCount date }
        }
      }
    }
  }
}`;

export type Kontribusi = {
  total: number;
  /** Dipakai untuk grafik; urut lama → baru. */
  hari: { tanggal: string; jumlah: number }[];
};

export async function getKontribusiGithub(): Promise<Kontribusi | null> {
  const token = process.env.GH_READ_USER_TOKEN_PERSONAL;
  const username = process.env.GITHUB_USERNAME || "zazaaw";
  if (!token) return null;

  try {
    const res = await fetch(GITHUB_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({ query: GITHUB_QUERY, variables: { username } }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const json = await res.json();
    const kalender =
      json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!kalender) return null;

    const hari = kalender.weeks
      .flatMap((w: any) => w.contributionDays)
      .map((d: any) => ({ tanggal: d.date, jumlah: d.contributionCount }));

    return { total: kalender.totalContributions, hari };
  } catch {
    return null;
  }
}

/* ── WakaTime: waktu ngoding ─────────────────────────────────────────── */

export type Waka = {
  /** Total sepanjang waktu, mis. "1.234 hrs 5 mins". */
  total: string;
  /** Bahasa terbanyak 7 hari terakhir. */
  bahasa: { nama: string; persen: number }[];
};

export async function getWakatime(): Promise<Waka | null> {
  const key = process.env.WAKATIME_API_KEY;
  if (!key) return null;

  try {
    const [allTime, stats] = await Promise.all([
      fetch("https://wakatime.com/api/v1/users/current/all_time_since_today", {
        headers: { Authorization: `Basic ${key}` },
        next: { revalidate: 3600 },
      }),
      fetch("https://wakatime.com/api/v1/users/current/stats/last_7_days", {
        headers: { Authorization: `Basic ${key}` },
        next: { revalidate: 3600 },
      }),
    ]);

    if (!allTime.ok) return null;

    const a = await allTime.json();
    const total: string | undefined = a?.data?.text;
    if (!total) return null;

    let bahasa: Waka["bahasa"] = [];
    if (stats.ok) {
      const s = await stats.json();
      bahasa = (s?.data?.languages ?? [])
        .slice(0, 4)
        .map((l: any) => ({ nama: l.name, persen: l.percent }));
    }

    return { total, bahasa };
  } catch {
    return null;
  }
}

/* ── Last.fm: lagu yang sedang / terakhir diputar ────────────────────── */

export type Lagu = {
  judul: string;
  artis: string;
  sedangDiputar: boolean;
  gambar: string | null;
  url: string | null;
};

export async function getNowPlaying(): Promise<Lagu | null> {
  const key = process.env.LASTFM_API_KEY;
  const user = process.env.LASTFM_USERNAME;
  if (!key || !user) return null;

  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
        `&user=${encodeURIComponent(user)}&api_key=${key}&format=json&limit=1`,
      // Lagu berganti terus — cache pendek saja.
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;

    const json = await res.json();
    const track = json?.recenttracks?.track?.[0];
    if (!track) return null;

    // Last.fm mengirim beberapa ukuran gambar; ambil yang terbesar dan tidak kosong.
    const gambar =
      [...(track.image ?? [])]
        .reverse()
        .find((i: any) => i?.["#text"])?.["#text"] ?? null;

    return {
      judul: track.name ?? "",
      artis: track.artist?.["#text"] ?? "",
      sedangDiputar: track["@attr"]?.nowplaying === "true",
      gambar,
      url: track.url ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Foto-foto Satu Visual dari database portfolio, untuk latar panel login yang
 * berganti otomatis.
 *
 * Dibaca dengan anon key lewat REST langsung — tabel `photography` memang
 * publik (sudah dipakai halaman portfolio tanpa login), jadi tidak perlu
 * service role. Gagal apa pun dikembalikan sebagai array kosong supaya
 * halaman login tidak ikut tumbang kalau portfolio sedang mati.
 */
export async function getFotoShowcase(limit = 12): Promise<string[]> {
  const url = process.env.PORTFOLIO_SUPABASE_URL;
  const key = process.env.PORTFOLIO_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  try {
    const r = await fetch(
      `${url}/rest/v1/photography?select=image_url&order=created_at.desc&limit=${limit}`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        // Foto jarang berubah; cache sejam supaya tiap kunjungan ke halaman
        // login tidak menembak database lagi.
        next: { revalidate: 3600 },
      }
    );
    if (!r.ok) return [];
    const data: Array<{ image_url: string | null }> = await r.json();
    return data.map((d) => d.image_url).filter((u): u is string => !!u);
  } catch {
    return [];
  }
}
