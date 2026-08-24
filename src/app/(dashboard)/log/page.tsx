import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { bacaLog } from "@/services/log";
import { formatWIB } from "@/services/waktu";

export const metadata: Metadata = { title: "Log" };
export const dynamic = "force-dynamic";

export default async function LogPage() {
  const log = await bacaLog();

  return (
    <BlurFade>
      <PageHeader
        title="Log"
        subtitle="Catatan setiap percobaan presensi — otomatis maupun manual. Berguna untuk memastikan penjadwal benar-benar jalan."
      />

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
        {log.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">
            Belum ada catatan.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {log.map((e, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-4">
                {e.ok ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{e.pesan}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatWIB(e.waktu)} · {e.aksi} · {e.sumber}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BlurFade>
  );
}
