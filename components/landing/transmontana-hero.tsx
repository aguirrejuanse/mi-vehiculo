"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { scrollToHash } from "@/lib/landing/smooth-scroll";

// Event hero for /transmontana — separate from the rotating Hero (this one
// has a fixed message and both CTAs scroll to #checklist: the checklist
// card doubles as the create-moto form). "use client" only for the
// scrollToHash click handlers, same reason footer.tsx is client.
export function TransmontanaHero() {
  function scrollTo(hash: string) {
    return (event: MouseEvent<HTMLAnchorElement>) =>
      scrollToHash(hash, event);
  }

  return (
    <div className="grid min-h-screen snap-start content-center items-center gap-10 md:grid-cols-2">
      {/* Centered below md: single-column stack reads awkward hugging the
          left edge next to the centered logo. From md the two-column grid
          takes over and left-alignment is right again. */}
      <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
        <h1 className="text-3xl leading-tight font-black tracking-tight uppercase sm:text-4xl lg:text-5xl">
          ¿Vas al <span className="text-primary">Transmontaña</span>?
        </h1>
        <p className="max-w-md text-lg text-muted">
          Dejá tu moto lista para la carrera.
        </p>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold tracking-widest uppercase">
            9 al 11 de octubre · San Salvador de Jujuy
          </p>
          <p className="text-sm text-muted">
            Enduro en parejas · Circuitos de 110 km y 70 km
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row md:items-start">
          <a
            href="#checklist"
            onClick={scrollTo("#checklist")}
            className="cursor-pointer rounded-2xl bg-primary px-6 py-3 text-center text-base font-bold tracking-widest text-white uppercase transition-colors hover:bg-primary-hover"
          >
            Ver el checklist
          </a>
          <a
            href="#checklist"
            onClick={scrollTo("#checklist")}
            className="cursor-pointer rounded-2xl border border-surface-border px-6 py-3 text-center text-base font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground"
          >
            Crear mi moto
          </a>
        </div>
      </div>

      {/* The logo asset is a white mark on a black square with ~25% internal
          margins — rendered edge-to-edge inside a rounded, overflow-hidden
          frame it IS the dark tile (same visual idea as the TopLoader mark),
          no inner padding needed. order-first: on mobile the brand mark
          leads, then the headline; from md it sits in the right column. */}
      <div className="relative order-first aspect-square w-full max-w-xs self-center overflow-hidden rounded-[2rem] border border-surface-border sm:max-w-sm md:order-none md:justify-self-end">
        <Image
          src="/transmontana.png"
          alt="Transmontaña — enduro en parejas, San Salvador de Jujuy"
          fill
          sizes="(min-width: 768px) 384px, 320px"
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
