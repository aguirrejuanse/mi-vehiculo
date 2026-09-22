"use client";

import type { MouseEvent } from "react";
import { scrollToHash } from "@/lib/landing/smooth-scroll";

// Points at the wizard section on the same page (`id="crear"` in
// landing-page.tsx). Without JS, or with reduced motion, the plain anchor
// jumps there; otherwise we scroll smoothly — see lib/landing/smooth-scroll
// for why this isn't `scroll-behavior` on <html>.
export function CreateVehicleLink() {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    scrollToHash("#crear", event);
  }

  return (
    <a
      href="#crear"
      onClick={handleClick}
      className="cursor-pointer rounded-2xl bg-primary px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-colors hover:bg-primary-hover"
    >
      Crear tu vehículo
    </a>
  );
}
