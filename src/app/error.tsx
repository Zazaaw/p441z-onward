"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { LogoOnward } from "@/components/logo-onward";
import { Button } from "@/components/ui/button";

/**
 * Penangkap galat tak terduga. Pesan aslinya sengaja TIDAK ditampilkan —
 * isinya bisa memuat detail internal (nama tabel, potongan kueri) yang tidak
 * pantas dilihat pengguna. Yang ditampilkan hanya digest-nya, cukup untuk
 * mencocokkan dengan log server bila perlu ditelusuri.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <LogoOnward className="text-base" />

      <div>
        <p className="text-2xl font-bold tracking-tight">Ada yang tersendat</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Coba muat ulang. Kalau masih berulang, tunggu sebentar lalu kembali
          lagi.
        </p>
        {error.digest && (
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            {error.digest}
          </p>
        )}
      </div>

      <Button onClick={reset} variant="outline">
        <RotateCcw className="size-4" />
        Coba lagi
      </Button>
    </main>
  );
}
