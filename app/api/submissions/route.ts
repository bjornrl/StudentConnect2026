import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isValidPair, OTHER_KEY, LEVELS } from "@/lib/taxonomy";
import type { PublicSubmission } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_LEVELS = new Set<string>(LEVELS.map((l) => l.key));

export async function GET() {
  const { data, error } = await getSupabase()
    .from("sc_submissions_public")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submissions: (data ?? []) as PublicSubmission[] });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const industry_key = String(body.industry_key ?? "");
  const subarea_key = String(body.subarea_key ?? "");
  const subarea_other =
    subarea_key === OTHER_KEY ? String(body.subarea_other ?? "").trim().slice(0, 80) : null;
  const title = String(body.title ?? "").trim();
  const challenge = String(body.challenge ?? "").trim();
  const company_name = String(body.company_name ?? "").trim();
  const levels = Array.isArray(body.levels)
    ? body.levels.map(String).filter((l) => VALID_LEVELS.has(l))
    : [];

  if (!isValidPair(industry_key, subarea_key)) {
    return NextResponse.json({ error: "Ukjent bransje eller ansvarsområde." }, { status: 400 });
  }
  if (subarea_key === OTHER_KEY && (!subarea_other || subarea_other.length < 2)) {
    return NextResponse.json({ error: "Beskriv ansvarsområdet." }, { status: 400 });
  }
  if (title.length < 3 || title.length > 120) {
    return NextResponse.json({ error: "Tittelen må være mellom 3 og 120 tegn." }, { status: 400 });
  }
  if (challenge.length < 10 || challenge.length > 4000) {
    return NextResponse.json({ error: "Beskrivelsen må være mellom 10 og 4000 tegn." }, { status: 400 });
  }
  if (company_name.length < 2) {
    return NextResponse.json({ error: "Bedriftsnavn mangler." }, { status: 400 });
  }

  /* Anon-rollen har INSERT, men bevisst ingen SELECT på sc_submissions —
     det er slik kontaktinfoen holdes utilgjengelig. Da kan vi heller ikke
     bruke RETURNING, så id-en lages her og sendes med inn.               */
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();

  const { error } = await getSupabase().from("sc_submissions").insert({
    id,
    created_at,
    industry_key,
    subarea_key,
    subarea_other,
    title,
    challenge,
    levels,
    status: "published",
    company_name,
    contact_name: body.contact_name ? String(body.contact_name).trim().slice(0, 120) : null,
    contact_email: body.contact_email ? String(body.contact_email).trim().slice(0, 200) : null,
    contact_phone: body.contact_phone ? String(body.contact_phone).trim().slice(0, 40) : null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const submission: PublicSubmission = {
    id,
    created_at,
    industry_key,
    subarea_key,
    subarea_other,
    title,
    challenge,
    levels,
  };

  return NextResponse.json({ submission });
}
