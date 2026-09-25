import { NextResponse } from "next/server";
import { getSupabase, publicDbError } from "@/lib/supabase";
import { TOPICS } from "@/lib/topics";

export const dynamic = "force-dynamic";

const VALID_TOPICS = new Set<string>(TOPICS);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const idea = String(body.idea ?? "").trim();
  const company_name = String(body.company_name ?? "").trim();
  const contact_name = String(body.contact_name ?? "").trim();
  const contact_email = String(body.contact_email ?? "").trim();
  const topics = Array.isArray(body.topics)
    ? [...new Set(body.topics.map(String).filter((t) => VALID_TOPICS.has(t)))]
    : [];

  if (idea.length < 3 || idea.length > 4000) {
    return NextResponse.json({ error: "Skriv litt om tanken deres (maks 4000 tegn)." }, { status: 400 });
  }
  if (!company_name || company_name.length > 200) {
    return NextResponse.json({ error: "Fyll inn bedriftsnavn." }, { status: 400 });
  }
  if (!contact_name || contact_name.length > 120) {
    return NextResponse.json({ error: "Fyll inn navnet ditt." }, { status: 400 });
  }
  if (!EMAIL.test(contact_email) || contact_email.length > 200) {
    return NextResponse.json({ error: "Sjekk at e-postadressen er riktig." }, { status: 400 });
  }

  /* Anon har bare INSERT på sc_ideas, så vi kan ikke lese raden tilbake. */
  const { error } = await getSupabase()
    .from("sc_ideas")
    .insert({ idea, topics, company_name, contact_name, contact_email });

  if (error) return NextResponse.json({ error: publicDbError(error) }, { status: 500 });
  return NextResponse.json({ ok: true });
}
