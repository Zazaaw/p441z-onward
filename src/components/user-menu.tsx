"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/services/auth-actions";
import type { SessionUser } from "@/services/auth";

export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSignOut = async () => {
    setLoading(true);
    try {
      await signOutAction();
      toast.success("Berhasil keluar.");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-tight">{user.name}</p>
        <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onSignOut}
        disabled={loading}
        aria-label="Keluar"
      >
        {loading ? <Loader2 className="animate-spin" /> : <LogOut />}
        <span className="hidden sm:inline">Keluar</span>
      </Button>
    </div>
  );
}
