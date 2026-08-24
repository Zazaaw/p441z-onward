"use client";

import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarNav } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-neutral-200 bg-white/80 px-4 backdrop-blur",
          "dark:border-neutral-800 dark:bg-neutral-950/80"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </Button>

        <div className="flex-1" />

        <ModeToggle />

        {/* TODO: tampilkan nama user dari sesi, dan sambungkan ke signOut(). */}
        <Button variant="ghost" size="sm" disabled title="Menunggu auth">
          <LogOut />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </header>

      {/* Drawer mobile */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r border-neutral-200 bg-white p-4 md:hidden",
              "dark:border-neutral-800 dark:bg-neutral-950"
            )}
          >
            <div className="mb-6 px-3">
              <p className="text-sm font-bold">Absensi</p>
              <p className="text-xs text-muted-foreground">Panel pengelolaan</p>
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
