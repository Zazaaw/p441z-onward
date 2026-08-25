import "./globals.css";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: "Onward",
    template: "%s · Onward",
  },
  description: "Maju sedikit setiap hari. Satu hari lebih baik dari kemarin.",
  // Internal tool — jangan diindeks mesin pencari.
  robots: { index: false, follow: false },
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
