"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

/** «Se mulighetene»-knappen i steg 3, og vinduet den åpner. */
export default function OpportunitiesModal() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  function open() {
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }

  function close() {
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
      openerRef.current?.focus();
    }, 300);
  }

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [mounted]);

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={open}
        className="mt-auto inline-flex items-center justify-center px-6 py-3 border-2 border-kp-black bg-white text-kp-black text-sm font-bold uppercase tracking-wider hover:bg-kp-lime rounded-xl kp-btn group"
      >
        Se mulighetene
        <Icon n={2} className="w-4 h-4 ml-2 brightness-0 group-hover:translate-x-1 transition-transform" />
      </button>

      {mounted && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="fixed inset-0 bg-kp-black/80 backdrop-blur-sm" aria-hidden onClick={close} />

          <div
            className={`relative bg-white border-4 border-kp-black rounded-2xl shadow-[12px_12px_0px_0px_#00ffa0] w-full max-w-2xl overflow-hidden transition-transform duration-300 flex flex-col max-h-[90vh] ${
              visible ? "scale-100" : "scale-95"
            }`}
          >
            <div className="absolute top-0 right-0 pt-6 pr-6 z-50">
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="bg-white text-kp-black hover:bg-kp-pink border-2 border-kp-black rounded-lg p-2 kp-btn"
              >
                <span className="sr-only">Lukk</span>
                <Icon n={1} className="h-6 w-6 brightness-0" />
              </button>
            </div>

            <div className="p-8 sm:p-12 overflow-y-auto">
              <div className="inline-block bg-kp-lime text-kp-black border-2 border-kp-black px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider mb-6 shadow-[2px_2px_0px_0px_rgba(15,15,15,1)]">
                Muligheter
              </div>
              <h3 className="text-3xl sm:text-4xl font-black mb-6 leading-tight" id="modal-title">
                Hvordan kan et samarbeid se ut?
              </h3>
              <p className="text-xl sm:text-2xl text-kp-black font-medium leading-relaxed mb-10">
                Et samarbeid tar den formen som passer best for dere og studentene. Det kan strekke seg fra et
                intensivt hackathon på én kveld, til et halvt års fordypning gjennom en masteroppgave. Kortere
                prosjektløp og internships er også gode muligheter.
              </p>
              <button
                type="button"
                onClick={close}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border-2 border-kp-black bg-kp-black text-white text-lg font-bold hover:bg-kp-neon hover:text-kp-black rounded-xl kp-btn"
              >
                Lukk vinduet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
