"use client";

import type { MouseEvent, ReactNode } from "react";
import { scrollToHash } from "@/lib/landing/smooth-scroll";

// Same-page anchor that scrolls smoothly when JS is on (native jump
// otherwise, incl. reduced-motion — see lib/landing/smooth-scroll). Exists
// so server components (e.g. /moto-checklist's hero) can ship a smooth
// scroll CTA without becoming client components themselves.
export function ScrollLink({
  hash,
  className,
  children,
}: {
  hash: string;
  className?: string;
  children: ReactNode;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    scrollToHash(hash, event);
  }

  return (
    <a href={hash} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
