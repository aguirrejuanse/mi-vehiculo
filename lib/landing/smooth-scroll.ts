import type { MouseEvent } from "react";

// Shared by every in-page anchor on the landing page (hero CTA, footer
// links). Scrolls via JS instead of `scroll-behavior: smooth` on <html>
// because that would also smooth Next's route-transition scroll-to-top,
// not just these anchor jumps.
export function scrollToHash(hash: string, event: MouseEvent<HTMLAnchorElement>) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.getElementById(hash.slice(1));
  if (!target) return;

  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  target.focus({ preventScroll: true });
  history.replaceState(null, "", hash);
}
