"use client";

import Link from "next/link";

/* Den flytende linja øverst. Navnet til venstre, én vei ut til høyre — mer
   skal det ikke være, for alt annet på siden er tavla.

   `demo` slår på merkelappen i midten. Den står bare på /edit: det er der
   knappen sier «Publiser» og lappene ser ekte ut, og da må det stå et sted
   man ikke kan unngå å se at ingen av delene gjelder ennå. */
type Props = {
  onAbout: () => void;
  demo?: boolean;
};

export default function BoardNav({ onAbout, demo = false }: Props) {
  return (
    <nav className="nav">
      <Link className="nav-wordmark" href="/">
        Koblingspunkt
      </Link>

      {demo && (
        <p className="nav-tag">
          <span className="nav-tag-dot" aria-hidden />
          {/* To varianter, én synlig om gangen. `display: none` tar den andre
              ut av tilgjengelighetstreet også, så skjermlesere leser bare den
              som faktisk vises. */}
          <span className="nav-tag-long">
            Lappene er eksempelforslag — det som meldes inn blir ikke publisert
          </span>
          <span className="nav-tag-short">Demo · publiseres ikke</span>
        </p>
      )}

      <button className="nav-link" onClick={onAbout}>
        Om oss
      </button>
    </nav>
  );
}
