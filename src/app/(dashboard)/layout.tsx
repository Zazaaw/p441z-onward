import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { getSession } from "@/services/auth";

/**
 * Shell untuk semua halaman terproteksi.
 *
 * Ini LAPIS KEDUA penjagaan. Proxy (src/proxy.ts) sudah menyaring lebih dulu,
 * tapi proxy berjalan di Edge runtime yang terbatas. Layout ini berjalan di
 * Node runtime penuh, jadi di sinilah verifikasi sesi yang sebenarnya
 * dilakukan — dan dari sini pula data user diambil untuk header.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSession();

  // Seharusnya sudah dicegat proxy, tapi jangan pernah bergantung pada satu
  // lapis saja.
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-muted/40">
      <AppSidebar />
      <div className="flex min-h-screen flex-col md:pl-60">
        <AppHeader user={user} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
