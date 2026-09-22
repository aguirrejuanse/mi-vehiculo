"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { scrollToHash } from "@/lib/landing/smooth-scroll";

type NavLink = {
  label: string;
  hash: string;
  // Below this breakpoint the link is hidden — between sm and lg there's
  // only room for 2 links before they wrap/squeeze, so the other 3 drop out
  // first and only reappear from lg up.
  visibleFrom: "sm" | "lg";
};

// Below sm the whole nav is hidden: on mobile there's only room for
// "Iniciar sesión" / "Crear tu vehículo". Every anchor points at a landing
// section ("/#hash"); when already on "/" the click is intercepted for a
// smooth scroll (see lib/landing/smooth-scroll), otherwise Link does a
// normal navigation to "/#hash" and the browser jumps on load — this header
// is global (app/layout.tsx), so it has to work from any route.
const NAV_LINKS: readonly NavLink[] = [
  { label: "Cómo funciona", hash: "#como-funciona", visibleFrom: "sm" },
  // "Funcionalidades" is a long word: paired with "Cómo funciona" and
  // "Iniciar sesión" it wrapped the header between 640–720px. Held back to
  // lg alongside the other 3 links instead of its own sm slot.
  { label: "Funcionalidades", hash: "#funcionalidades", visibleFrom: "lg" },
  { label: "Casos de uso", hash: "#casos-de-uso", visibleFrom: "lg" },
  { label: "Testimonios", hash: "#testimonios", visibleFrom: "lg" },
  { label: "FAQ", hash: "#preguntas-frecuentes", visibleFrom: "lg" },
];

const VISIBILITY_CLASSES: Record<NavLink["visibleFrom"], string> = {
  sm: "hidden sm:flex",
  lg: "hidden lg:flex",
};

export function HeaderNav() {
  return (
    <ul className="flex items-center gap-5">
      {NAV_LINKS.map((link) => (
        <li key={link.hash} className={VISIBILITY_CLASSES[link.visibleFrom]}>
          <Link
            href={`/${link.hash}`}
            onClick={(event: MouseEvent<HTMLAnchorElement>) =>
              scrollToHash(link.hash, event)
            }
            className="text-sm font-semibold tracking-wide text-muted transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
