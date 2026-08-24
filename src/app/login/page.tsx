import type { Metadata } from "next";
import BlurFade from "@/components/effects/blur-fade";
import DotPattern from "@/components/effects/dot-pattern";
import Typography from "@/components/ui/typography";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      {/* Satu lapis tekstur saja di sini — halaman login sengaja lebih tenang
          daripada dashboard. */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <DotPattern
          width={22}
          height={22}
          cx={1}
          cy={1}
          cr={1}
          className="[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
        />
      </div>

      <BlurFade className="relative z-20 w-full max-w-sm">
        <div className="mb-8 text-center">
          <Typography.H3 className="mt-0 text-2xl font-bold">
            Dashboard Absensi
          </Typography.H3>
          <Typography.P className="mt-2 text-sm text-muted-foreground">
            Masuk dengan akun yang terdaftar untuk melanjutkan.
          </Typography.P>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Akses terbatas. Hubungi administrator bila belum punya akun.
        </p>
      </BlurFade>
    </main>
  );
}
