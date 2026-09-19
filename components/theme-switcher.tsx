"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { setThemeAction } from "@/app/actions";
import {
  isThemeChoice,
  SYSTEM_THEME,
  THEME_CHOICES,
  type Theme,
} from "@/lib/theme";

type ThemeSwitcherProps = {
  initialTheme: Theme | null;
};

// Native `<select>`: keyboard and screen reader support for free, and the OS
// picker on mobile. The DOM attribute is updated right away for instant
// feedback; the server action persists the cookie so the next request renders
// the same `data-theme` (and invalidates the client router cache). "Sistema"
// deletes the cookie so the `prefers-color-scheme` fallback applies again.
export function ThemeSwitcher({ initialTheme }: ThemeSwitcherProps) {
  const [selected, setSelected] = useState(initialTheme ?? SYSTEM_THEME);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    if (!isThemeChoice(next)) return;

    setSelected(next);
    if (next === SYSTEM_THEME) {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = next;
    }
    startTransition(() => setThemeAction(next));
  }

  return (
    <select
      aria-label="Tema"
      value={selected}
      onChange={handleChange}
      disabled={isPending}
      className="cursor-pointer rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs font-bold tracking-widest text-foreground uppercase transition-colors hover:border-primary disabled:cursor-wait disabled:opacity-60"
    >
      {THEME_CHOICES.map((choice) => (
        <option key={choice.value} value={choice.value}>
          {choice.label}
        </option>
      ))}
    </select>
  );
}
