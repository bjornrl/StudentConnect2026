import Link from "next/link";
import Image from "next/image";
import Aurora from "@/components/Aurora";
import { PARTNERS } from "@/lib/partners";

/* ─────────────────────────────────────────────────────────────────────────────
   Forsiden.

   Det er hierarkiet som bærer siden, ikke bakgrunnen. Rekkefølgen er
   kjennemerke → tittel → ingress → utdypning → én handling → finskrift →
   partnere, og hvert trinn er tydelig svakere enn det over: størrelse, vekt og
   farge faller sammen, og luften over et element sier hvor et nytt trinn
   begynner. Derfor er avstandene med vilje ujevne — jevn `gap` ville gjort alle
   trinnene like viktige.

   Bare ÉN fylt knapp. «Vis kartet» står som tekstlenke ved siden av: den er
   like lett å finne, men den konkurrerer ikke med innmeldingen, som er det
   siden faktisk vil at bedriftene skal gjøre. De to like store kortene som lå
   her før ba besøkende velge mellom to jevnbyrdige ting.

   Kortet rundt innholdet er borte — teksten står rett på flaten, slik
   referansene gjør det, og luften rundt gjør jobben kortet gjorde. Auroraen
   ligger igjen, men nedtonet til en anelse (se `.home` i globals.css).
   ──────────────────────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <main className="home">
      <Aurora />

      <header className="home-bar">
        <span className="home-wordmark">Koblingspunkt</span>
        <span className="home-meta">Oslo · 2026</span>
      </header>

      <div className="home-hero">
        <p className="home-eyebrow">Student Connect 2026</p>

        <h1 className="home-title">Hva vil dere utforske?</h1>

        <p className="home-lead">
          Vi inviterer bedrifter i Oslo til å melde inn temaer de gjerne vil vite mer om, eller
          utfordringer de vil ha løst.
        </p>


        <div className="home-actions">
          <Link href="/edit" className="btn-primary home-cta">
            Meld inn en utfordring
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="/presentation" className="home-secondary">
            Vis kartet
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Finskriften bærer samtykket, så den skal stå — men under handlingen
            og i minste trinn, ikke som et tredje avsnitt på linje med ingressen
            slik den gjorde før. */}
        <p className="home-fineprint">
          Koblingspunkt matcher utfordringene med studenter og studentteam. De kan skape nye
          løsninger, gi nye perspektiver og energi inn i innovasjonsarbeidet deres.
        </p>
        <p className="home-fineprint">
          Det er uforpliktende å registrere. Hva som meldes inn, og av hvem, er kun tilgjengelig for
          oss i Koblingspunkt — og ved å registrere godkjenner dere at vi kan ta kontakt for å bidra
          med studenter som kan løse utfordringen.
        </p>
      </div>

      {/* Samarbeidspartnerne nederst. Høyden per logo er satt i lib/partners.ts
          — lik høyde gir ikke lik tyngde. */}
      <footer className="home-partners">
        <p className="home-partners-label">I samarbeid med</p>
        <div className="home-logos">
          {PARTNERS.map((p) => (
            <Image
              key={p.src}
              src={p.src}
              alt={p.alt}
              width={p.width}
              height={p.height}
              style={{ height: p.displayHeight }}
            />
          ))}
        </div>
      </footer>
    </main>
  );
}
