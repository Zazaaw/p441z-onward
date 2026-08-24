import type { Metadata } from "next";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { getPengaturan } from "@/services/pengaturan";
import { FormOtomasi } from "./form-otomasi";

export const metadata: Metadata = { title: "Otomasi" };
export const dynamic = "force-dynamic";

export default async function OtomasiPage() {
  const pengaturan = await getPengaturan();

  return (
    <BlurFade>
      <PageHeader
        title="Otomasi"
        subtitle="Atur jadwal check-in dan check-out otomatis. Jam dipilih acak dalam rentang yang kamu tentukan."
      />
      <FormOtomasi awal={pengaturan} />
    </BlurFade>
  );
}
