import { Skeleton } from "@/components/ui/skeleton";

/** Meniru layout log: judul, lalu daftar baris berikon di dalam satu kotak. */
export default function Loading() {
  return (
    <>
      <Skeleton className="mb-2 h-9 w-32" />
      <Skeleton className="mb-6 h-5 w-72" />
      <div className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4">
            <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
