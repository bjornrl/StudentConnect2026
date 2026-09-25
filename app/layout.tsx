import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

/* Designet ber om GT Flexa Black/Bold, men det vi har er Condensed Regular.
   Den dekker hele vektområdet, så nettleseren ikke lager falsk fet skrift av
   den når overskriftene ber om font-black. Kommer de riktige snittene, legges
   de til her med hver sin weight. */
const flexa = localFont({
  src: [{ path: "./fonts/GT-Flexa-Condensed-Regular.ttf", weight: "100 900", style: "normal" }],
  variable: "--font-gt-flexa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Koblingspunkt",
  description:
    "Hva kan studentene se som dere ikke ser selv? Send oss en tanke, så kobler vi dere med studenter i Oslo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00ffa0",
};

/* Cloudflare Web Analytics — gratis, cookieløs besøksstatistikk. Settes som
   NEXT_PUBLIC_CF_BEACON_TOKEN i Netlify. Uten token lastes ikke skriptet. */
const cfBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={flexa.variable}>
      <body className="font-sans antialiased text-kp-black flex flex-col min-h-screen bg-kp-neon">
        {children}
        {cfBeaconToken && (
          <Script
            id="cf-web-analytics"
            strategy="afterInteractive"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: cfBeaconToken })}
          />
        )}
      </body>
    </html>
  );
}
