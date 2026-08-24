import type { Metadata } from "next";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { riwayatPresensi } from "@/services/presensi";
import { formatJamWIB } from "@/services/waktu";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Riwayat" };
export const dynamic = "force-dynamic";

const WARNA: Record<string, string> = {
  hadir: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  telat: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  dinas: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  izin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default async function RiwayatPage() {
  const data = await riwayatPresensi(90);

  return (
    <BlurFade>
      <PageHeader
        title="Riwayat"
        subtitle={`${data.length} presensi terakhir.`}
      />

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-muted-foreground dark:border-neutral-800 dark:bg-neutral-900/50">
              <tr>
                <th className="px-5 py-3 font-semibold">Tanggal</th>
                <th className="px-5 py-3 font-semibold">Masuk</th>
                <th className="px-5 py-3 font-semibold">Keluar</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Jenis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    Belum ada data presensi.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
                    <td className="whitespace-nowrap px-5 py-3 font-medium tabular-nums">{r.tanggal}</td>
                    <td className="whitespace-nowrap px-5 py-3 tabular-nums">{formatJamWIB(r.jam_masuk)}</td>
                    <td className="whitespace-nowrap px-5 py-3 tabular-nums">
                      {r.jam_keluar ? (
                        formatJamWIB(r.jam_keluar)
                      ) : (
                        <span className="text-red-500">belum</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                        WARNA[r.status] ?? "bg-neutral-500/10 text-neutral-500 border-neutral-500/20"
                      )}>
                        {r.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {r.jenis}{r.shift ? ` · ${r.shift}` : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </BlurFade>
  );
}
