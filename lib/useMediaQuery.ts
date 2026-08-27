"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Brytpunktet mobil/desktop. Ligger her så CSS og JS ikke kan gli fra
 * hverandre — samme tallet står i `@media (max-width: 900px)` i globals.css.
 */
export const MOBILE_BREAKPOINT = 900;

/**
 * Sann når mediespørringen matcher.
 *
 * useSyncExternalStore i stedet for useState + useEffect: matchMedia *er* et
 * eksternt lager, og da slipper vi renderen der svaret er feil før effekten
 * rekker å rette det opp. Serveren har ingen vindusbredde, så der svarer vi
 * `false` — altså desktop — og React bytter til riktig verdi ved hydrering.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
}
