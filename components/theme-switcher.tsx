"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { setThemeAction } from "@/app/actions";
import {
  isThemeChoice,
  SYSTEM_THEME,
  THEME_CHOICES,
  type Theme,
  type ThemeChoice,
} from "@/lib/theme";

const THEME_CHANNEL = "theme";

type ThemeSwitcherProps = {
  initialTheme: Theme | null;
};

function applyTheme(choice: ThemeChoice) {
  if (choice === SYSTEM_THEME) {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = choice;
  }
}

// Native `<select>`: keyboard and screen reader support for free, and the OS
// picker on mobile. The DOM attribute is updated right away for instant
// feedback; the server action persists the cookie so the next request renders
// the same `data-theme` (and invalidates the client router cache). "Sistema"
// deletes the cookie so the `prefers-color-scheme` fallback applies again.
export function ThemeSwitcher({ initialTheme }: ThemeSwitcherProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<ThemeChoice>(
    initialTheme ?? SYSTEM_THEME,
  );
  const [isPending, startTransition] = useTransition();

  // Follow the theme rendered by the server layout (e.g. after a refresh
  // picked up a change made in another tab).
  const [previousInitialTheme, setPreviousInitialTheme] =
    useState(initialTheme);
  if (initialTheme !== previousInitialTheme) {
    setPreviousInitialTheme(initialTheme);
    setSelected(initialTheme ?? SYSTEM_THEME);
  }

  // Keep other tabs in sync. The message is only posted after the cookie was
  // saved, so the `router.refresh()` on the receiving side reads the new
  // value. The refresh runs once per actual change and re-renders the layout
  // with the new `data-theme`, so this tab's cached layouts do not put the old
  // theme back on a later navigation.
  const channelRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(THEME_CHANNEL);
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (!isThemeChoice(event.data)) return;
      setSelected(event.data);
      applyTheme(event.data);
      router.refresh();
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [router]);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    // Not `disabled` while pending: that would drop keyboard focus.
    if (isPending) return;

    const next = event.target.value;
    if (!isThemeChoice(next)) return;

    const previous = selected;
    setSelected(next);
    applyTheme(next);

    startTransition(async () => {
      try {
        await setThemeAction(next);
      } catch {
        // Nothing was persisted: put the UI back where it was.
        setSelected(previous);
        applyTheme(previous);
        return;
      }
      // Separate from the action: the cookie is saved, so a broadcast failure
      // must neither roll the UI back nor reach the error boundary.
      try {
        channelRef.current?.postMessage(next);
      } catch {
        // Other tabs pick the theme up on their next full load.
      }
    });
  }

  return (
    <select
      aria-label="Tema"
      aria-busy={isPending}
      value={selected}
      onChange={handleChange}
      className="cursor-pointer rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs font-bold tracking-widest text-foreground uppercase transition-colors hover:border-primary aria-busy:cursor-wait aria-busy:opacity-60"
    >
      {THEME_CHOICES.map((choice) => (
        <option key={choice.value} value={choice.value}>
          {choice.label}
        </option>
      ))}
    </select>
  );
}
