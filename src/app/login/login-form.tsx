"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/services/auth-actions";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lihat, setLihat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signInAction(email, password);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      toast.success(`Selamat datang, ${result.user.name}.`);

      // Kembalikan ke halaman yang tadi diminta, kalau ada.
      // Hanya terima path relatif — URL absolut dari query bisa dipakai
      // untuk open-redirect ke situs lain.
      const next = params.get("next");
      const target =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/dashboard";

      router.replace(target);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@perusahaan.com"
          disabled={loading}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Kata sandi
        </label>
        <div className="relative">
          <Input
            id="password"
            type={lihat ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            className="h-11 pr-11"
          />
          <button
            type="button"
            onClick={() => setLihat((v) => !v)}
            disabled={loading}
            // Tombol ini murni bantuan visual; tidak perlu masuk urutan tab.
            tabIndex={-1}
            aria-label={lihat ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            {lihat ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-500"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        className={cn("h-11 w-full", loading && "cursor-wait")}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Memproses…
          </>
        ) : (
          <>
            Masuk
            <ArrowRight />
          </>
        )}
      </Button>
    </form>
  );
}
