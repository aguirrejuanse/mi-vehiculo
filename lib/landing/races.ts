export type Race = {
  slug: string;
  // Display name with the event's own spelling (may carry accents).
  name: string;
  // The two info lines under the hero subtitle.
  dateLine: string;
  detailLine: string;
  // Meta/OG description — first person plural copy, ends with the
  // checklist→vehicle pitch.
  description: string;
  image: string;
  imageAlt: string;
  // localStorage key for checked items — stable per race so progress
  // survives deploys. "transmontana" keeps the original key: anyone
  // mid-list on the old /transmontana URL keeps their checkmarks.
  storageKey: string;
  // Analytics/form `source` value — matches the checklist's hidden input.
  source: string;
};

export const TRANSMONTANA: Race = {
  slug: "transmontana",
  name: "Transmontaña",
  dateLine: "9 al 11 de octubre · San Salvador de Jujuy",
  detailLine: "Enduro en parejas · Circuitos de 110 km y 70 km",
  description:
    "Checklist pre-carrera para el Transmontaña: enduro en parejas del 9 al 11 de octubre en San Salvador de Jujuy. Marcá lo que ya le hiciste a tu moto y creá tu vehículo para que el plan cuente los intervalos solo.",
  image: "/transmontana.png",
  imageAlt: "Transmontaña — enduro en parejas, San Salvador de Jujuy",
  storageKey: "mv:transmontana-checklist",
  source: "transmontana",
};

export const RACES: readonly Race[] = [TRANSMONTANA];

export function findRace(slug: string): Race | undefined {
  return RACES.find((race) => race.slug === slug);
}
