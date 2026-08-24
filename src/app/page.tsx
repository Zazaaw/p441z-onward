import { redirect } from "next/navigation";

/**
 * Tidak ada landing page — ini alat internal. Middleware yang memutuskan
 * apakah user berakhir di /dashboard atau dilempar ke /login.
 */
export default function RootPage() {
  redirect("/dashboard");
}
