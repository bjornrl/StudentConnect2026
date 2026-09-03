import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/* Skriften er byttet fra Aeonik til Inter — det er den Figma-fila setter
   tavla og panelet i. next/font henter den ned ved bygg og serverer den fra
   vårt eget domene, så det er ingen forespørsel ut til Google i nettleseren.

   Variabelen heter --font-sc og ikke --font-sans med vilje: Tailwind
   definerer --font-sans selv, og de to ville kjempet om samme navn på :root. */
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Koblingspunkt — Student Connect 2026",
  description:
    "Bedrifter henger opp utfordringer de vil utforske. Tavla viser dem samlet, og studenter kan ta tak i dem.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* Tavla går helt ut i kantene — da må vi kjenne safe-area-innsettene på
     telefoner med hakk/hjemindikator. */
  viewportFit: "cover",
  themeColor: "#f5f5f5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
