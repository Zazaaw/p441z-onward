import { Skeleton } from "@/components/ui/skeleton";

/** Meniru layout riwayat: judul, lalu tabel di dalam satu kotak. */
export default function Loading() {
  return (
    <>
      <Skeleton className="mb-2 h-9 w-36" />
      <Skeleton className="mb-6 h-5 w-80" />
      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        {/* Baris kepala tabel */}
        <div className="flex gap-4 border-b border-neutral-200 p-4 dark:border-neutral-800">
          {["w-24", "w-20", "w-20", "w-16", "w-24"].map((w, i) => (
            <Skeleton key={i} className={`h-4 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-neutral-200 p-4 last:border-0 dark:border-neutral-800"
          >
            {["w-24", "w-20", "w-20", "w-16", "w-24"].map((w, j) => (
              <Skeleton key={j} className={`h-4 ${w}`} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
