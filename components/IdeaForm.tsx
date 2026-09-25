"use client";

import { useState, type FormEvent } from "react";
import Icon from "@/components/Icon";
import { TOPICS } from "@/lib/topics";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string };

const inputClass =
  "w-full bg-kp-gray border-2 border-kp-black focus:border-kp-black focus:bg-white rounded-lg px-4 py-3 transition-colors shadow-[2px_2px_0px_0px_rgba(15,15,15,1)]";

/** Skjemaet nederst på forsiden. Sender til /api/ideas, som lagrer i Supabase (sc_ideas). */
export default function IdeaForm({ onSent }: { onSent: () => void }) {
  const [topics, setTopics] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function toggle(topic: string) {
    setTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus({ kind: "sending" });

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: form.get("tanke"),
          topics,
          company_name: form.get("bedrift"),
          contact_name: form.get("navn"),
          contact_email: form.get("epost"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Noe gikk galt. Prøv igjen.");
      onSent();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Noe gikk galt. Prøv igjen.",
      });
    }
  }

  const sending = status.kind === "sending";

  return (
    <form className="space-y-10" onSubmit={onSubmit}>
      <div>
        <label htmlFor="tanke" className="sr-only">
          Din tanke
        </label>
        <textarea
          id="tanke"
          name="tanke"
          rows={6}
          required
          minLength={3}
          maxLength={4000}
          className="w-full text-xl md:text-2xl bg-kp-gray border-2 border-kp-black focus:border-kp-black focus:bg-white rounded-xl p-6 placeholder-gray-500 resize-none transition-all shadow-[4px_4px_0px_0px_rgba(15,15,15,1)]"
          placeholder="For eksempel: Vi har snakket lenge om hvordan KI kan gjøre kundeservicen vår bedre, men vi vet ikke hvor vi bør begynne..."
        />
      </div>

      <fieldset>
        <legend className="text-sm font-black text-kp-black mb-4 uppercase tracking-wider">
          Dette handler omtrent om (valgfritt):
        </legend>
        <div className="flex flex-wrap gap-3">
          {TOPICS.map((topic) => {
            const on = topics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(topic)}
                className={`cursor-pointer border-2 border-kp-black px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  on
                    ? "bg-kp-blue text-white shadow-none translate-y-0.5"
                    : "bg-white text-kp-black shadow-[2px_2px_0px_0px_rgba(15,15,15,1)] hover:bg-kp-gray hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(15,15,15,1)]"
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t-2 border-kp-black">
        <div>
          <label htmlFor="bedrift" className="block text-sm font-black text-kp-black mb-2 uppercase tracking-wider">
            Bedrift
          </label>
          <input type="text" id="bedrift" name="bedrift" required maxLength={200} autoComplete="organization" className={inputClass} />
        </div>
        <div>
          <label htmlFor="navn" className="block text-sm font-black text-kp-black mb-2 uppercase tracking-wider">
            Navn
          </label>
          <input type="text" id="navn" name="navn" required maxLength={120} autoComplete="name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="epost" className="block text-sm font-black text-kp-black mb-2 uppercase tracking-wider">
            E-post
          </label>
          <input type="email" id="epost" name="epost" required maxLength={200} autoComplete="email" className={inputClass} />
        </div>
      </div>

      <div className="pt-6">
        {status.kind === "error" && (
          <p role="alert" className="mb-6 border-2 border-kp-black bg-kp-orange rounded-lg px-4 py-3 font-bold">
            {status.message}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 border-2 border-kp-black bg-kp-black text-white text-lg font-bold hover:bg-kp-lime hover:text-kp-black rounded-xl kp-btn group"
        >
          {sending ? "Sender…" : "Send inn"}
          <Icon n={2} className="w-6 h-6 ml-3 invert group-hover:invert-0 transition-all" />
        </button>
        <p className="mt-4 text-sm text-kp-black font-bold">
          Helt uforpliktende. Vi deler ikke det du sender inn offentlig uten å avtale med dere først.
        </p>
      </div>
    </form>
  );
}
