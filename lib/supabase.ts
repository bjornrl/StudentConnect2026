import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

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

  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
