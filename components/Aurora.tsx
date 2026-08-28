/**
 * De ni fargeflatene som driver rundt i bakgrunnen — forsiden og skjemaruta på
 * /edit deler dem. Ren dekor; plassering, farge og bane ligger på `.aurora` i
 * globals.css, så flatene her er tomme med vilje.
 *
 * Forelderen må ha `position: relative`, `isolation: isolate` og `overflow:
 * hidden` — flatene stikker utenfor kanten og ligger på z-index -1.
 */
export default function Aurora() {
  return (
    <div className="aurora" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}
