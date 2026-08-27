import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Connect 2026 — oppgavekart",
  description:
    "Bedrifter melder inn utfordringer de vil utforske. Kartet viser dem samlet, sortert etter bransje og ansvarsområde.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>{children}</body>
    </html>
  );
}
