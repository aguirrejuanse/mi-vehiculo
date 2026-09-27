import type { MouseEvent } from "react";

// Shared by every in-page anchor on the landing page (hero CTA, footer
// links). Scrolls via JS instead of `scroll-behavior: smooth` on <html>
// because that would also smooth Next's route-transition scroll-to-top,
// not just these anchor jumps.
export function scrollToHash(hash: string, event: MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById(hash.slice(1));
  // The section can live on a different page (nav links point at
  // `/${hash}`) — only intercept when it exists right here.
  if (!target) return;

  // Reduced motion still jumps in-page, just instantly — falling back to
  // the native navigation would leave the page for the same section.
  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  event.preventDefault();
  target.scrollIntoView({
    behavior: reduced ? "instant" : "smooth",
    block: "start",
  });
  target.focus({ preventScroll: true });
  history.replaceState(null, "", hash);
}
