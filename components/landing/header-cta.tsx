"use client";

import type { MouseEvent } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { scrollToHash } from "@/lib/landing/smooth-scroll";

// On the landing page (`id="crear"` exists there, see landing-page.tsx),
// smooth-scrolls to the wizard instead of navigating away — same treatment
// as create-vehicle-link.tsx. scrollToHash no-ops when "#crear" isn't on the
// current page (any other route), so the click falls through to this Link's
// own href and does a normal navigation to /nuevo — this header is global
// (app/layout.tsx), so it has to work from any route.
export function HeaderCta() {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    scrollToHash("#crear", event);
  }

  return (
    <LinkButton
      href="/nuevo"
      onClick={handleClick}
      size="sm"
      bare
      className="cursor-pointer text-center text-xs font-bold tracking-wide uppercase sm:text-sm"
    >
      Crear tu vehículo
    </LinkButton>
  );
}
