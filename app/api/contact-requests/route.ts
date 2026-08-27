import { NextResponse } from "next/server";
import { getSupabase, publicDbError } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const submission_id = String(body.submission_id ?? "");
  const requester_name = String(body.requester_name ?? "").trim();
  const requester_email = String(body.requester_email ?? "").trim();

  if (!submission_id) return NextResponse.json({ error: "Mangler oppgave." }, { status: 400 });
  if (requester_name.length < 2) return NextResponse.json({ error: "Skriv inn navn." }, { status: 400 });
  if (!requester_email.includes("@")) {
    return NextResponse.json({ error: "Skriv inn en gyldig e-postadresse." }, { status: 400 });
  }

  const { error } = await getSupabase().from("sc_contact_requests").insert({
    submission_id,
    requester_name: requester_name.slice(0, 120),
    requester_email: requester_email.slice(0, 200),
    requester_role: body.requester_role ? String(body.requester_role).trim().slice(0, 120) : null,
    message: body.message ? String(body.message).trim().slice(0, 2000) : null,
  });

  if (error) return NextResponse.json({ error: publicDbError(error) }, { status: 500 });
  return NextResponse.json({ ok: true });
}
