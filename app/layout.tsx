import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Connect 2026 — oppgavekart",
  description:
    "Bedrifter melder inn utfordringer de vil utforske. Kartet viser dem samlet og gruppert etter bransje.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* Kartet og bunnarkene går helt ut i kantene — da må vi kjenne
     safe-area-innsettene på telefoner med hakk/hjemindikator. */
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#101110" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>{children}</body>
    </html>
  );
}
