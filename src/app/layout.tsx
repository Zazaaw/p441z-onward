import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"] });

// Aksen editorial — Times Ten Italic, self-hosted. Font yang sama dengan
// yang dipakai portfolio, jadi kedua situs berbagi rasa huruf yang identik.
// Dipakai hanya untuk paruh italic pada logo.
const timesTen = localFont({
  src: "./fonts/TimesTenItalic.ttf",
  // JANGAN pakai "--font-serif": Tailwind v4 sudah mendefinisikan variabel
  // itu (ui-serif, Georgia, ...), jadi keduanya bertabrakan dan yang menang
  // bergantung urutan CSS. Nama sendiri supaya tidak ada tumpang tindih.
  variable: "--font-editorial",
  display: "swap",
});

const DESKRIPSI = "Maju sedikit setiap hari. Satu hari lebih baik dari kemarin.";

// Dipakai untuk menyusun URL absolut pada Open Graph. Di produksi diisi lewat
// NEXT_PUBLIC_SITE_URL agar tidak perlu ganti kode saat domain berubah.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://onward.p441z.my.id";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Onward",
    template: "%s · Onward",
  },
  description: DESKRIPSI,
  applicationName: "Onward",
  // Open Graph: tanpa ini, tautan yang dibagikan lewat WhatsApp/Slack cuma
  // tampil sebagai URL telanjang tanpa judul maupun keterangan.
  openGraph: {
    type: "website",
    siteName: "Onward",
    title: "Onward",
    description: DESKRIPSI,
    locale: "id_ID",
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: "Onward",
    description: DESKRIPSI,
  },
  // Internal tool — jangan diindeks mesin pencari.
  robots: { index: false, follow: false },
};

// Warna bilah alamat di ponsel, mengikuti tema terang/gelap.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${sans.className} ${timesTen.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
