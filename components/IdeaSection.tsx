"use client";

import { useRef, useState } from "react";
import Icon from "@/components/Icon";
import IdeaForm from "@/components/IdeaForm";

/* Skjemaet og avslutningen under det. Når tanken er sendt, er det ikke noe
   mer å be om: overskriften over skjemaet og hele «Har dere noe …»-seksjonen
   forsvinner, og takken står alene med en knapp tilbake til toppen. */
export default function IdeaSection() {
  const [sent, setSent] = useState(false);
  const thanksRef = useRef<HTMLDivElement>(null);

  function onSent() {
    setSent(true);
    requestAnimationFrame(() => thanksRef.current?.focus());
  }

  function goHome() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <>
      <section id="skjema" className="py-24 md:py-32 bg-kp-neon relative border-t-2 border-kp-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white border-4 border-kp-black p-8 md:p-12 lg:p-16 rounded-2xl shadow-solid-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-kp-blue border-b-4 border-l-4 border-kp-black rounded-bl-3xl -mr-16 -mt-16 z-0 pointer-events-none" />
            <Icon n={7} className="absolute bottom-8 right-8 w-16 h-16 opacity-10 pointer-events-none z-0" />

            <div className="relative z-10">
              {sent ? (
                <div ref={thanksRef} tabIndex={-1} role="status" className="py-6 outline-none">
                  <div className="inline-block bg-kp-lime text-kp-black border-2 border-kp-black px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider mb-6 shadow-[2px_2px_0px_0px_rgba(15,15,15,1)]">
                    Sendt
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Takk! Vi har fått tanken deres.</h2>
                  <p className="text-lg text-kp-black font-medium mb-10">
                    Vi tar kontakt innen én uke for en kort scope-samtale på 30 minutter.
                  </p>
                  <button
                    type="button"
                    onClick={goHome}
                    className="cursor-pointer inline-flex items-center justify-center px-8 py-4 border-2 border-kp-black bg-kp-black text-white text-lg font-bold hover:bg-kp-lime hover:text-kp-black rounded-xl kp-btn group"
                  >
                    Hjem
                    <Icon n={2} className="w-6 h-6 ml-3 invert group-hover:invert-0 transition-all" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                    Hva skulle dere gjerne hatt noen nye øyne på?
                  </h2>
                  <p className="text-lg text-kp-black font-medium mb-10">
                    Skriv det akkurat slik dere ville forklart det til en kollega. Det trenger ikke være ferdig formulert.
                  </p>
                  <IdeaForm onSent={onSent} />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {!sent && (
        <section className="py-24 md:py-32 text-center bg-kp-neon">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Har dere noe dere burde sett nærmere på?</h2>
            <p className="text-xl text-kp-black font-medium mb-10 max-w-2xl mx-auto">
              Ikke bruk tid på å lage en perfekt problemstilling. Send oss tanken deres, så tar vi det videre derfra.
            </p>
            <a
              href="#skjema"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-kp-black bg-kp-black text-white text-lg font-bold hover:bg-kp-lime hover:text-kp-black rounded-xl kp-btn group"
            >
              Send inn
              <Icon n={2} className="w-6 h-6 ml-3 md:w-7 md:h-7 invert group-hover:invert-0 transition-all" />
            </a>
          </div>
        </section>
      )}
    </>
  );
}
