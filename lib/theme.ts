export const THEME_COOKIE = "theme";

export const THEMES = [
  { value: "claro", label: "Claro" },
  { value: "oscuro", label: "Oscuro" },
  { value: "fast-furious", label: "Fast & Furious" },
  { value: "gta-vi", label: "GTA VI" },
] as const;

export type Theme = (typeof THEMES)[number]["value"];

export function isTheme(value: unknown): value is Theme {
  return THEMES.some((theme) => theme.value === value);
}

// Selector value: a real theme, or "sistema" (no cookie, follow the OS).
export const SYSTEM_THEME = "sistema";

export type ThemeChoice = Theme | typeof SYSTEM_THEME;

export const THEME_CHOICES: readonly {
  value: ThemeChoice;
  label: string;
}[] = [{ value: SYSTEM_THEME, label: "Sistema" }, ...THEMES];

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === SYSTEM_THEME || isTheme(value);
}
