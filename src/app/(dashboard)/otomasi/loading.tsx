import { Skeleton } from "@/components/ui/skeleton";

/** Meniru layout otomasi: judul, lalu form pengaturan. */
export default function Loading() {
  return (
    <>
      <Skeleton className="mb-2 h-9 w-32" />
      <Skeleton className="mb-6 h-5 w-96" />
      <div className="max-w-2xl space-y-6 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
        <Skeleton className="h-11 w-32" />
      </div>
    </>
  );
}
