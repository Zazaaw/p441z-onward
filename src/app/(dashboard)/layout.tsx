import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

/**
 * Shell untuk semua halaman terproteksi.
 *
 * TODO (setelah auth siap): panggil getSession() di sini dan redirect kalau
 * null. Middleware saja tidak cukup sebagai satu-satunya penjaga — layout
 * server component adalah lapis kedua yang berjalan di Node runtime penuh,
 * jadi bisa memverifikasi token dengan benar.
 */
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-muted/40">
      <AppSidebar />
      {/* Geser konten sejauh lebar sidebar di desktop */}
      <div className="flex min-h-screen flex-col md:pl-60">
        <AppHeader />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
