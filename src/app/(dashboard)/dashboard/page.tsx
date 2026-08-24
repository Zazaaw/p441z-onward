import type { Metadata } from "next";
import { CalendarCheck, UserCheck, UserX, Clock } from "lucide-react";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import Typography from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Angka masih placeholder — sambungkan ke sumber data setelah backend siap.
 */
const STATS = [
  { label: "Hadir hari ini", value: "—", icon: UserCheck, tone: "emerald" },
  { label: "Tidak hadir", value: "—", icon: UserX, tone: "red" },
  { label: "Terlambat", value: "—", icon: Clock, tone: "amber" },
  { label: "Total karyawan", value: "—", icon: CalendarCheck, tone: "blue" },
] as const;

// Warna hanya dipakai sebagai penanda status — sesuai aturan kit.
const TONES: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-500",
  red: "bg-red-500/10 text-red-500",
  amber: "bg-amber-500/10 text-amber-500",
  blue: "bg-blue-500/10 text-blue-500",
};

export default function DashboardPage() {
  return (
    <BlurFade>
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan kehadiran hari ini dan aktivitas terbaru."
        action={<Button disabled title="Menunggu backend">Perbarui data</Button>}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, tone }, i) => (
          <BlurFade key={label} inView delay={i * 0.05}>
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs transition-all duration-300 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700">
              <div className={`w-fit rounded-lg p-2 ${TONES[tone]}`}>
                <Icon className="size-5" />
              </div>
              <p className="mt-4 text-3xl font-bold">{value}</p>
              <p className="text-xs font-medium text-muted-foreground">
                {label}
              </p>
            </div>
          </BlurFade>
        ))}
      </div>

      <Typography.H4 className="mb-3 mt-10">Aktivitas terbaru</Typography.H4>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Belum ada data. Sambungkan sumber data untuk mulai menampilkan
            aktivitas.
          </p>
        </div>
      </div>
    </BlurFade>
  );
}
