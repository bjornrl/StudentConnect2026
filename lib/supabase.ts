import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/** Prosjekt-ref-en i en Supabase-URL: https://<ref>.supabase.co */
function refFromUrl(url: string): string | null {
  return /^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/.exec(url.trim())?.[1] ?? null;
}

/**
 * Prosjekt-ref-en i en anon-nøkkel, når nøkkelen er en gammeldags JWT.
 * Nye `sb_publishable_…`-nøkler har ingen ref i seg, og gir null.
 */
function refFromKey(key: string): string | null {
  const payload = key.split(".")[1];
  if (!payload || !key.startsWith("ey")) return null;
  try {
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.ref === "string" ? json.ref : null;
  } catch {
    return null;
  }
}

/**
 * URL og nøkkel må høre til det SAMME Supabase-prosjektet. Blandes de, svarer
 * PostgREST enten «Invalid API key» eller «Could not find the table … in the
 * schema cache» — begge deler ser ut som en databasefeil, men er en konfigfeil.
 * Netlify har delte miljøvariabler på team-nivå; blir bare den ene overstyrt
 * per site, ender man nettopp her.
 */
function assertSameProject(url: string, key: string): void {
  const urlRef = refFromUrl(url);
  const keyRef = refFromKey(key);
  if (urlRef && keyRef && urlRef !== keyRef) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL peker på prosjektet «${urlRef}», mens ` +
        `NEXT_PUBLIC_SUPABASE_ANON_KEY hører til «${keyRef}». Begge må komme fra ` +
        `samme Supabase-prosjekt. På Netlify: sett dem på site-nivå ` +
        `(Site configuration → Environment variables), ikke arv dem fra teamet.`
    );
  }
}

/**
 * Supabase-klient med den publiserbare anon-nøkkelen. Den kan bare:
 *   • lese public.sc_submissions_public (uten kontaktinfo)
 *   • sette inn rader i sc_submissions og sc_contact_requests
 * Alt annet er stengt av row level security.
 *
 * Klienten lages først når den brukes, slik at `next build` ikke krasjer
 * i miljøer der miljøvariablene ennå ikke er satt.
 */
export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Mangler NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Kopier .env.example til .env.local."
    );
  }

  assertSameProject(url, key);

  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

/** Brukervennlig melding når PostgREST ikke ser tabellene våre. */
export function publicDbError(error: { code?: string; message: string }): string {
  if (error.code === "PGRST205" || /schema cache/i.test(error.message)) {
    return (
      "Fant ikke sc_-tabellene i Supabase-prosjektet appen er koblet til. Enten " +
      "peker NEXT_PUBLIC_SUPABASE_URL på feil prosjekt, eller så er ikke " +
      "supabase/setup.sql kjørt der."
    );
  }
  if (/invalid api key/i.test(error.message)) {
    return (
      "Supabase avviste anon-nøkkelen. NEXT_PUBLIC_SUPABASE_ANON_KEY hører til et " +
      "annet prosjekt enn NEXT_PUBLIC_SUPABASE_URL."
    );
  }
  return error.message;
}
