"use client";

import type { MouseEvent } from "react";

// Points at the wizard section on the same page (`id="crear"` in
// landing-page.tsx). Without JS, or with reduced motion, the plain anchor
// jumps there; otherwise we scroll smoothly. Smooth scrolling is done here
// instead of `scroll-behavior` on <html> because Next 16 would then smooth
// every route transition too.
export function CreateVehicleLink() {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = document.getElementById("crear");
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.focus({ preventScroll: true });
    history.replaceState(null, "", "#crear");
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
