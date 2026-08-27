import Link from "next/link";

export default function Home() {
  return (
    <main className="home">
      <div className="home-inner">
        <span className="home-eyebrow">Student Connect 2026</span>
        <h1>Hva vil dere at studentene skal utforske?</h1>
        <p>
          Bedrifter melder inn utfordringer, spørsmål og temaer de gjerne skulle visst mer om.
          Hver innmelding blir en node i et felles kart, gruppert etter bransje og koblet sammen
          med andre som jobber med det samme.
        </p>
        <div className="home-links">
          <Link href="/edit" className="home-card">
            <strong>Fyll ut →</strong>
            <span>Skjema på venstre side, kartet vokser på høyre.</span>
          </Link>
          <Link href="/presentation" className="home-card">
            <strong>Vis kartet →</strong>
            <span>Fullskjerm for storskjerm og stand.</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
