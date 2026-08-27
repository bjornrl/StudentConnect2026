# Neue Haas Grotesk

Fonten er lisensiert og ligger derfor ikke i repoet. Legg woff2-filene her, med
nøyaktig disse navnene — `@font-face`-reglene øverst i `app/globals.css` peker
på dem:

| Fil | Vekt |
| --- | --- |
| `NeueHaasGrotesk-Roman.woff2` | 400 (brødtekst) |
| `NeueHaasGrotesk-Medium.woff2` | 500–600 (mellomtitler, knapper) |
| `NeueHaasGrotesk-Bold.woff2` | 700 (overskrifter) |

Har du bare otf/ttf, konverter til woff2 først — det er rundt en tredjedel av
størrelsen, og er det eneste formatet som er verdt å sende over nett.

Mangler filene, faller siden ned på Helvetica Neue. Det er samme grotesk-slekt,
så oppsettet flytter seg knapt — men det er ikke fonten deres.

Sjekk lisensen før filene commites til et offentlig repo. Skal de ikke ligge i
git, kan de lastes opp direkte i Netlify eller legges bak en privat kilde.
