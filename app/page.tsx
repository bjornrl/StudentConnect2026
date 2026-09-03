import { redirect } from "next/navigation";

/* Forsiden er lagt ned. Tavla er inngangen — det som sto her ligger nå i
   «Om oss» på selve tavla. Ruta beholdes så gamle lenker ikke dør. */
export default function Home() {
  redirect("/edit");
}
