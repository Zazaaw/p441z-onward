"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  FileBarChart,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Sumber tunggal navigasi. Sidebar desktop dan drawer mobile membacanya dari
 * sini, jadi tidak mungkin beda isi.
 */
type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { heading: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    heading: "Ringkasan",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Data",
    items: [
      { href: "/absensi", label: "Absensi", icon: CalendarCheck },
      { href: "/karyawan", label: "Karyawan", icon: Users },
      { href: "/laporan", label: "Laporan", icon: FileBarChart },
    ],
  },
  {
    heading: "Sistem",
    items: [{ href: "/pengaturan", label: "Pengaturan", icon: Settings }],
  },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {NAV.map((group) => (
        <div key={group.heading}>
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {group.heading}
          </p>
          <ul className="space-y-1">
            {group.items.map(({ href, label, icon: Icon }) => {
              // Cocokkan persis, atau sebagai prefix untuk sub-halaman.
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Button
                    asChild
                    variant={active ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link href={href} onClick={onNavigate}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AppSidebar() {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-neutral-200 bg-white p-4 md:flex",
        "dark:border-neutral-800 dark:bg-neutral-950"
      )}
    >
      <div className="mb-6 px-3">
        <p className="text-sm font-bold">Absensi</p>
        <p className="text-xs text-muted-foreground">Panel pengelolaan</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
      </div>
    </aside>
  );
}
