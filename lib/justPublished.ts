"use client";

/**
 * På mobil har /edit ikke plass til kartet ved siden av skjemaet, så etter
 * publisering sender vi brukeren videre til /presentation. Id-en legges igjen
 * i sessionStorage slik at kartet vet hvilken node som nettopp kom til — uten
 * å legge den i URL-en, der den ville blitt liggende etter en refresh.
 */
const KEY = "sc:just-published";

export function setJustPublished(id: string) {
  try {
    sessionStorage.setItem(KEY, id);
  } catch {
    /* privat modus e.l. — da mister vi bare pulsen */
  }
}

/** Leser og fjerner i samme slengen, så banneret bare vises én gang. */
export function takeJustPublished(): string | null {
  try {
    const id = sessionStorage.getItem(KEY);
    if (id) sessionStorage.removeItem(KEY);
    return id;
  } catch {
    return null;
  }
}
