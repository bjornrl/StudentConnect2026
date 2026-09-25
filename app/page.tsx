import Image from "next/image";
import Icon from "@/components/Icon";
import IdeaSection from "@/components/IdeaSection";
import OpportunitiesModal from "@/components/OpportunitiesModal";

const chip = "shadow-[2px_2px_0px_0px_rgba(15,15,15,1)]";
const heroTag =
  "text-sm md:text-base font-bold tracking-widest uppercase text-kp-black border-2 border-kp-black inline-block px-4 py-1.5 rounded-lg shadow-[4px_4px_0px_0px_rgba(15,15,15,1)]";

const EXAMPLES = [
  {
    icon: 1,
    tag: "KI",
    color: "bg-kp-blue",
    quote: "«Vi vet at vi burde bruke KI smartere, men hvor gir det egentlig mening hos oss?»",
    answer: "Studenter kan kartlegge arbeidsprosesser, undersøke muligheter og finne områder det er verdt å teste.",
  },
  {
    icon: 10,
    tag: "Kunder",
    color: "bg-kp-lime",
    quote: "«Vi skjønner ikke helt hva yngre kunder forventer av oss.»",
    answer: "Studenter kan undersøke målgruppen, finne behov og komme med nye perspektiver.",
  },
  {
    icon: 8,
    tag: "Arbeidsliv",
    color: "bg-kp-pink",
    quote: "«Hvordan blir vi mer attraktive for unge arbeidstakere?»",
    answer: "Studenter kan undersøke hvordan nye generasjoner ser på jobb, kultur og arbeidsgivere.",
  },
  {
    icon: 5,
    tag: "Bærekraft",
    color: "bg-kp-orange",
    quote: "«Vi har produkter og ressurser vi burde bruke på en smartere måte.»",
    answer: "Studenter kan utforske sirkulære løsninger, nye anvendelser eller alternative forretningsmodeller.",
  },
  {
    icon: 6,
    tag: "Noe helt annet",
    color: "bg-white",
    quote: "«Vi har hatt denne tanken lenge, men aldri fått tid til å se nærmere på den.»",
    answer: "Det er nettopp slike ting vi gjerne vil høre om.",
    last: true,
  },
];

const BENEFITS = [
  {
    color: "bg-kp-lime",
    title: "Nye perspektiver",
    text: "Få andre øyne på spørsmål dere har blitt litt for vant til å se selv.",
  },
  {
    color: "bg-kp-blue",
    title: "Ny kompetanse",
    text: "Kom i kontakt med studenter som arbeider med teknologi, design, økonomi, kommunikasjon, bærekraft og andre fag.",
  },
  {
    color: "bg-kp-pink",
    title: "Se talenter i arbeid",
    text: "Et prosjekt er en fin måte å bli kjent med kompetanse dere ellers ikke ville møtt i en vanlig rekruttering.",
  },
];

const STEPS = [
  {
    color: "bg-kp-pink",
    offset: "md:top-0 z-30",
    title: "30 minutter scope-samtale",
    text: "En kort prat med en av oss for å spisse ideen. Vi tar kontakt innen 1 uke fra innsending.",
  },
  {
    color: "bg-kp-blue",
    offset: "md:top-8 z-20",
    title: "60 minutter dialog",
    text: "En fasilitert samtale med utvalgte studenter. Dette vil i seg selv allerede gi dere verdi og nye perspektiver.",
  },
  {
    color: "bg-kp-lime",
    offset: "md:top-16 z-10",
    title: "Veien videre",
    text: "Deretter velger dere en mulig vei videre. Det er uansett helt uforpliktende å teste ut samarbeidet.",
  },
];

const PARTNERS = [
  { name: "Punkt Oslo", href: "https://www.punktoslo.no/", hover: "hover:text-kp-neon" },
  { name: "Gründergarasjen", href: "https://grundergarasjen.no/", hover: "hover:text-kp-blue" },
  { name: "SEFiO", href: "https://sefio.no/", hover: "hover:text-kp-pink" },
  { name: "Comte", href: "https://comte.no/", hover: "hover:text-kp-orange" },
];

function PrimaryLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center px-8 py-4 border-2 border-kp-black bg-kp-black text-white text-lg font-bold hover:bg-kp-lime hover:text-kp-black rounded-xl kp-btn group ${className}`}
    >
      {children}
      <Icon n={2} className="w-6 h-6 ml-3 md:w-7 md:h-7 invert group-hover:invert-0 transition-all" />
    </a>
  );
}

export default function Home() {
  return (
    <>
      <nav className="fixed w-full bg-kp-neon/95 backdrop-blur-md z-50 border-b-2 border-kp-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="#" className="text-2xl font-black tracking-tighter focus:outline-none focus:underline">
            Koblingspunkt
          </a>
          <a
            href="#skjema"
            className="hidden sm:inline-flex items-center justify-center px-6 py-2 border-2 border-kp-black bg-white text-kp-black text-sm font-bold hover:bg-kp-lime kp-btn rounded-xl"
          >
            Send inn
            <Icon n={2} className="w-4 h-4 ml-2 md:w-5 md:h-5 brightness-0" />
          </a>
        </div>
      </nav>

      <main className="flex-grow pt-20">
        {/* Helt */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 md:pt-32 md:pb-32">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-4 mb-8">
                <p className={`${heroTag} bg-white`}>Oslo har 88 000 studenter.</p>
                <p className={`${heroTag} bg-white`}>Vi kan koble din bedrift med de skarpeste blant disse.</p>
                <p className={`${heroTag} bg-kp-lime`}>Umiddelbar verdi. Minimal innsats fra dere.</p>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] mb-8">
                Hva kan studentene se som dere ikke ser selv?
              </h1>
              <p className="text-xl md:text-2xl text-kp-black font-medium leading-relaxed max-w-2xl mb-12">
                Gi studenter noe å bryne seg på. Et spørsmål, en mulighet eller noe dere har tenkt at dere burde
                undersøke, men aldri får tid til.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <PrimaryLink href="#skjema">Gi studentene noe å utforske</PrimaryLink>
                <a
                  href="#eksempler"
                  className="inline-flex items-center text-lg font-bold text-kp-black hover:underline underline-offset-4 decoration-2 group"
                >
                  Se eksempler
                  <Icon n={2} className="w-5 h-5 ml-2 md:w-6 md:h-6 brightness-0 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              <p className="mt-8 text-base text-kp-black font-bold">
                Det holder med én setning. Dere trenger ikke ha en ferdig problemstilling.
              </p>
            </div>
            <div className="mt-12 lg:mt-0 border-4 border-kp-black rounded-xl overflow-hidden shadow-solid lg:shadow-solid-lg">
              <Image
                src="/kp/hero.png"
                alt="Illustrasjon av by, teknologi og ideer"
                width={2900}
                height={1320}
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Eksempler */}
        <section id="eksempler" className="bg-white border-y-2 border-kp-black py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-16">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Det kan begynne ganske uferdig.</h2>
              <p className="text-xl text-kp-black font-medium leading-relaxed">
                Dere trenger ikke vite hva løsningen er, eller engang nøyaktig hva problemet er. Her er eksempler på
                ting en bedrift kan komme til oss med:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {EXAMPLES.map((ex) => (
                <div
                  key={ex.tag}
                  className={`bg-kp-gray border-2 border-kp-black p-8 rounded-xl kp-card flex flex-col h-full relative overflow-hidden ${
                    ex.last ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <Icon n={ex.icon} className="absolute top-4 right-4 w-12 h-12 opacity-20 pointer-events-none" />
                  <span
                    className={`inline-block ${ex.color} text-kp-black border-2 border-kp-black font-bold uppercase tracking-wider px-3 py-1 rounded-lg text-xs mb-6 w-max ${chip}`}
                  >
                    {ex.tag}
                  </span>
                  <div className="flex-grow z-10">
                    <p className="text-sm text-kp-black font-bold mb-2 uppercase tracking-wider">Bedriften sier:</p>
                    <p className="text-xl font-bold leading-snug mb-6">{ex.quote}</p>
                  </div>
                  <div className="pt-6 border-t-2 border-kp-black z-10">
                    <p className={ex.last ? "text-kp-black font-bold text-lg" : "text-kp-black font-medium"}>{ex.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hva får dere ut av det */}
        <section className="py-24 md:py-32 bg-kp-neon border-b-2 border-kp-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-16 text-center">Hva får dere ut av det?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 px-4 md:px-0">
              {BENEFITS.map((b, i) => (
                <div key={b.title} className="text-center bg-white border-2 border-kp-black p-8 rounded-xl shadow-solid relative">
                  <div
                    className={`w-16 h-16 ${b.color} border-2 border-kp-black text-kp-black rounded-lg flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(15,15,15,1)]`}
                  >
                    {i + 1}
                  </div>
                  <h3 className="text-2xl font-black mb-4">{b.title}</h3>
                  <p className="text-kp-black font-medium text-lg">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stegene */}
        <section className="bg-kp-black text-white py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mb-20">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                Dere kommer med tanken. Vi krever minimalt av tiden deres.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:pb-16">
              {STEPS.map((s, i) => (
                <div
                  key={s.title}
                  className={`bg-white text-kp-black border-4 border-kp-black p-8 rounded-xl shadow-[8px_8px_0px_0px_#00ffa0] relative ${s.offset} hover:-translate-y-2 transition-transform duration-200 flex flex-col items-start`}
                >
                  <div
                    className={`inline-block ${s.color} text-kp-black border-2 border-kp-black px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider mb-6 ${chip}`}
                  >
                    Steg {i + 1}
                  </div>
                  <h3 className="text-3xl font-black mb-4">{s.title}</h3>
                  <p className={`font-medium text-lg leading-relaxed ${i === STEPS.length - 1 ? "mb-8" : ""}`}>{s.text}</p>
                  {i === STEPS.length - 1 && <OpportunitiesModal />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <IdeaSection />
      </main>

      <footer className="bg-kp-black text-white pt-24 pb-12 border-t-2 border-kp-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-3xl font-black tracking-tight mb-6">Om Koblingspunkt</h3>
              <p className="text-gray-300 font-medium leading-relaxed max-w-md text-lg">
                Koblingspunkt tester nye måter å gjøre det enklere for bedrifter og studenter i Oslo å finne hverandre og
                samarbeide om reelle spørsmål og muligheter.
              </p>
            </div>
            <div>
              <p className="text-sm font-black text-kp-neon uppercase tracking-wider mb-6">Utvikles av</p>
              <div className="flex flex-wrap items-center gap-6 text-white font-bold text-xl">
                {PARTNERS.map((p, i) => (
                  <span key={p.name} className="contents">
                    {i > 0 && <span className="text-gray-600">&middot;</span>}
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className={`${p.hover} transition-colors`}>
                      {p.name}
                    </a>
                  </span>
                ))}
              </div>
              <div className="mt-10 pt-10 border-t-2 border-gray-800">
                <p className="text-sm font-black text-kp-neon uppercase tracking-wider mb-4">Med støtte fra</p>
                <a
                  href="https://www.oslo.kommune.no/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-bold text-lg hover:text-kp-neon transition-colors"
                >
                  Oslo kommune
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400 font-medium border-t-2 border-gray-800 pt-8 gap-4">
            <p>&copy; 2026 Koblingspunkt.</p>
            <a
              href="#"
              className="hover:text-white underline decoration-gray-600 hover:decoration-kp-neon underline-offset-4 transition-colors"
            >
              Personvern
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
