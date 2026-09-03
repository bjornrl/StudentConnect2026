"use client";

import Link from "next/link";

/* Den flytende linja øverst. Navnet til venstre, én vei ut til høyre — mer
   skal det ikke være, for alt annet på siden er tavla. */
export default function BoardNav({ onAbout }: { onAbout: () => void }) {
  return (
    <nav className="nav">
      <Link className="nav-wordmark" href="/">
        Koblingspunkt
      </Link>
      <button className="nav-link" onClick={onAbout}>
        Om oss
      </button>
    </nav>
  );
}
