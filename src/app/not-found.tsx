import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoOnward } from "@/components/logo-onward";
import { Button } from "@/components/ui/button";

/**
 * Halaman 404 bermerek. Tanpa berkas ini pengguna mendapat halaman bawaan
 * Next yang polos dan tidak menyebut Onward sama sekali.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <LogoOnward className="text-base" />

      <div>
        <p className="text-6xl font-bold tracking-tighter">404</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Halaman yang kamu cari tidak ada — mungkin sudah dipindah atau
          tautannya keliru.
        </p>
      </div>

      <Button asChild variant="outline">
        <Link href="/">
          <ArrowLeft className="size-4" />
          Kembali ke beranda
        </Link>
      </Button>
    </main>
  );
}
