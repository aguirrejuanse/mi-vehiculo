export interface HeroItem {
  name: string;
  interval: string;
}

export interface HeroVariant {
  slug: string;
  subject: string;
  items: readonly HeroItem[];
}

// Rotation order matters: the first variant is the default one (SSR, no-JS,
// reduced motion), and it leads with offroad on purpose.
export const HERO_VARIANTS: readonly HeroVariant[] = [
  {
    slug: "moto-enduro",
    subject: "moto de enduro",
    items: [
      { name: "Aceite de motor", interval: "10-15 h" },
      { name: "Pistón", interval: "60-90 h" },
      { name: "Service de horquilla", interval: "45 h" },
      { name: "Líquido de frenos", interval: "90 h o 12 meses" },
      { name: "Líquido refrigerante", interval: "2 años" },
    ],
  },
  {
    slug: "bici-downhill",
    subject: "bici de downhill",
    items: [
      { name: "Service de horquilla", interval: "50 h" },
      { name: "Amortiguador", interval: "50 h (aire) / 200 h (completo)" },
      { name: "Purgar frenos", interval: "1 vez al año" },
      { name: "Tornillería", interval: "1 vez al mes" },
      { name: "Rodamientos", interval: "6-12 meses" },
    ],
  },
  {
    slug: "bici-enduro",
    subject: "bici de enduro",
    items: [
      { name: "Service de horquilla", interval: "50 h" },
      { name: "Amortiguador", interval: "50 h (aire) / 200 h (completo)" },
      { name: "Purgar frenos", interval: "1 vez al año" },
      { name: "Líquido tubeless", interval: "cada 3 meses" },
      { name: "Tornillería", interval: "1 vez al mes" },
    ],
  },
  {
    slug: "moto-calle",
    subject: "moto de calle",
    items: [
      { name: "Aceite de motor", interval: "3.000-6.000 km" },
      { name: "Lubricar cadena", interval: "500-1.000 km" },
      { name: "Bujía", interval: "12.000 km" },
      { name: "Filtro de aire", interval: "12.000-18.000 km" },
      { name: "Líquido de frenos", interval: "2 años" },
    ],
  },
  {
    slug: "auto",
    subject: "auto",
    items: [
      { name: "Aceite y filtro", interval: "10.000 km o 12 meses" },
      { name: "Pastillas de freno (revisar)", interval: "10.000 km" },
      { name: "Rotación de neumáticos", interval: "10.000 km" },
      { name: "Líquido de frenos", interval: "24 meses" },
      { name: "Bujías", interval: "30.000-60.000 km" },
    ],
  },
  {
    slug: "bici-ruta",
    subject: "bici de ruta",
    items: [
      { name: "Lubricar transmisión", interval: "300 km" },
      { name: "Limpiar transmisión", interval: "1 vez por semana" },
      { name: "Cambiar cadena", interval: "al 0,5 % de desgaste" },
      { name: "Purgar frenos", interval: "1 vez al año" },
      { name: "Líquido tubeless", interval: "cada 3 meses" },
    ],
  },
  {
    slug: "bici-electrica",
    subject: "bici eléctrica",
    items: [
      { name: "Cargar batería guardada", interval: "cada 3-6 meses" },
      { name: "Limpiar transmisión", interval: "1 vez por semana" },
      { name: "Purgar frenos", interval: "1 vez al año" },
      { name: "Líquido tubeless", interval: "cada 3 meses" },
      { name: "Tornillería", interval: "1 vez al mes" },
    ],
  },
  {
    slug: "monopatin",
    subject: "monopatín",
    // Only two items on purpose: an electric scooter has little to maintain.
    items: [
      { name: "Cargar batería al 100 %", interval: "cada 30 días" },
      { name: "Tornillería", interval: "cada 30 días" },
    ],
  },
];

export const DEFAULT_HERO_VARIANT = HERO_VARIANTS[0];

export function findHeroVariant(slug: string): HeroVariant | undefined {
  return HERO_VARIANTS.find((variant) => variant.slug === slug);
}
