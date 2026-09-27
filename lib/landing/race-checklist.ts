export type RaceChecklistItem = {
  key: string;
  label: string;
};

export type RaceChecklistGroup = {
  title: string;
  items: readonly RaceChecklistItem[];
};

// Static pre-race checklist for the Transmontaña landing — ordered roughly by
// how a rider works through the bike. Keys are stable: they're persisted in
// localStorage (see components/landing/race-checklist.tsx), so renaming one
// silently unchecks it for anyone mid-list.
export const RACE_CHECKLIST: readonly RaceChecklistGroup[] = [
  {
    title: "Ruedas",
    items: [
      { key: "cambiar-cubiertas", label: "Cambiar cubiertas" },
      { key: "cambiar-mousse-o-camara", label: "Cambiar mousse o cámara" },
      {
        key: "liquido-antipinchazos",
        label: "Líquido antipinchazos en la cámara",
      },
    ],
  },
  {
    title: "Transmisión",
    items: [
      { key: "tensar-lubricar-cadena", label: "Tensar y lubricar la cadena" },
      { key: "revisar-pinion-corona", label: "Revisar piñón y corona" },
    ],
  },
  {
    title: "Suspensión",
    items: [
      {
        key: "service-suspension",
        label: "Service de horquilla y monoshock",
      },
      { key: "setear-sag", label: "Setear el sag" },
    ],
  },
  {
    title: "Frenos",
    items: [
      { key: "revisar-pastillas", label: "Revisar pastillas" },
      { key: "nivel-liquido-frenos", label: "Nivel de líquido de frenos" },
    ],
  },
  {
    title: "Fluidos",
    items: [
      { key: "aceite-caja", label: "Aceite de caja al día" },
      { key: "nivel-refrigerante", label: "Nivel de refrigerante" },
      { key: "cargar-mezcla", label: "Cargar mezcla / nafta" },
    ],
  },
  {
    title: "Tornillería y motor",
    items: [
      { key: "apretar-tornillos", label: "Apretar todos los tornillos" },
      { key: "lavar-filtro-aire", label: "Lavar el filtro de aire" },
      { key: "bujia-nueva", label: "Bujía nueva + una de repuesto" },
    ],
  },
  {
    title: "Para la carrera",
    items: [
      {
        key: "herramientas",
        label: "Juego de herramientas (tubos 6, 8, 10 + torx)",
      },
      { key: "manijas-repuesto", label: "Manijas de repuesto" },
      { key: "camelback", label: "Camelback" },
      { key: "snacks", label: "Snacks" },
    ],
  },
];
