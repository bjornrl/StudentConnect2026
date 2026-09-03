import { NextResponse } from "next/server";
import { getSupabase, publicDbError } from "@/lib/supabase";
import { isValidPair, OTHER_KEY, UNSPECIFIED_INDUSTRY, LEVELS } from "@/lib/taxonomy";
import type { PublicSubmission } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_LEVELS = new Set<string>(LEVELS.map((l) => l.key));

/* ─────────────────────────────────────────────────────────────────────────────
   Hva som MÅ fylles ut, bestemmes i skjemaet — ikke her.

   Kravene har flyttet seg flere ganger nå (tittel var påkrevd, så valgfri;
   bransje og kontaktinfo var ute, så inne igjen). Ligger listen begge steder,
   glir de to fra hverandre, og da avvises innmeldinger med en feilmelding som
   ikke stemmer med det skjemaet nettopp sa. Derfor validerer ruta her FORMEN
   på det som kommer inn — lengder, gyldige nøkler — og ikke om alt er med.
   Det eneste som er absolutt påkrevd er utfordringen: uten den er det ingen
   lapp.

   Sentineler: `title`, `company_name` og `industry_key` er `not null` i basen,
   og `title` har i tillegg en check på 3–120 tegn. Kommer de ikke med, skriver
   vi en avtalt verdi for «ikke oppgitt» og oversetter den tilbake til tomt
   igjen når raden leses ut. Samme grep som `subarea_key = OTHER_KEY`, som
   allerede sto her. Skjemaet krever nå bedrift og bransje, så i praksis er det
   bare `title` som treffer dette — men eldre klienter og direkte POST-er gjør
   det fortsatt.
   ──────────────────────────────────────────────────────────────────────────── */
const NO_TITLE = "(uten tittel)";
const NO_COMPANY = "(ikke oppgitt)";

/** Sentinelene skal aldri ut i frontend — der betyr «ikke oppgitt» tom streng. */
function toPublic(row: PublicSubmission): PublicSubmission {
  return row.title === NO_TITLE ? { ...row, title: "" } : row;
}

export async function GET() {
  const { data, error } = await getSupabase()
    .from("sc_submissions_public")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: publicDbError(error) }, { status: 500 });
  return NextResponse.json({
    submissions: ((data ?? []) as PublicSubmission[]).map(toPublic),
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const challenge = String(body.challenge ?? "").trim();
  const title = String(body.title ?? "").trim();

  /* Bransje er tatt ut av skjemaet, men eldre klienter — og skjemaet igjen den
     dagen feltet kommer tilbake — kan fortsatt sende den. Kommer det ingen,
     lagrer vi «uoppgitt», og da tegner tavla lappen uten bransjebrikke. */
  const sentIndustry = String(body.industry_key ?? "").trim();
  const industry_key = sentIndustry || UNSPECIFIED_INDUSTRY;
  const subarea_key = String(body.subarea_key ?? "") || OTHER_KEY;
  const subarea_other =
    subarea_key === OTHER_KEY
      ? String(body.subarea_other ?? "").trim().slice(0, 80) || null
      : null;

  const company_name = String(body.company_name ?? "").trim() || NO_COMPANY;
  const levels = Array.isArray(body.levels)
    ? body.levels.map(String).filter((l) => VALID_LEVELS.has(l))
    : [];

  /* Utfordringen er det eneste som MÅ være der — det er hele lappen. */
  if (challenge.length < 10 || challenge.length > 4000) {
    return NextResponse.json(
      { error: "Beskrivelsen må være mellom 10 og 4000 tegn." },
      { status: 400 }
    );
  }
  // tittelen er valgfri, men skriver man en, skal den være til å lese
  if (title.length > 0 && (title.length < 3 || title.length > 120)) {
    return NextResponse.json({ error: "Tittelen må være mellom 3 og 120 tegn." }, { status: 400 });
  }
  if (sentIndustry && !isValidPair(sentIndustry, subarea_key)) {
    return NextResponse.json({ error: "Ukjent bransje eller ansvarsområde." }, { status: 400 });
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
    title: title || NO_TITLE,
    challenge,
    levels,
    status: "published",
    company_name,
    contact_name: body.contact_name ? String(body.contact_name).trim().slice(0, 120) : null,
    contact_email: body.contact_email ? String(body.contact_email).trim().slice(0, 200) : null,
    contact_phone: body.contact_phone ? String(body.contact_phone).trim().slice(0, 40) : null,
  });

  if (error) return NextResponse.json({ error: publicDbError(error) }, { status: 500 });

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
