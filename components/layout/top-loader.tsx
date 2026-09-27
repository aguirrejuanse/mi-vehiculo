"use client";

/**
 * Page-transition feedback — thin top bar immediately, plus a pulsing
 * brand-mark overlay if the navigation outlasts LOGO_DELAY_MS (fast
 * prefetched navs never flash it). Only page transitions trigger it;
 * in-page async (forms, mutations) has its own inline loading states.
 * An aborted navigation self-clears via the failsafe so the bar can't
 * pin forever.
 *
 * Phase transitions live in event handlers and timer callbacks, never
 * synchronous setState in an effect — react-hooks/set-state-in-effect
 * flags those as cascading renders.
 */

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_FAILSAFE_MS = 10_000;
const LOGO_DELAY_MS = 200;
const DONE_LINGER_MS = 300;

export function TopLoader() {
  const pathname = usePathname();
  const location = `${pathname}?${useSearchParams().toString()}`;

  const [phase, setPhase] = useState<"idle" | "nav" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [logoDue, setLogoDue] = useState(false);

  // Start on internal link click or history back/forward. A click whose
  // target keeps the same path+search (hash-only jump — the landing's
  // smooth-scroll anchors, see lib/landing/smooth-scroll.ts) isn't a nav.
  useEffect(() => {
    const startNav = () => {
      setPhase("nav");
      setLogoDue(false);
      setProgress(15);
    };
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as Element).closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }
      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      startNav();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", startNav);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", startNav);
    };
  }, []);

  // A committed URL change completes the pending navigation.
  const prevLocation = useRef(location);
  useEffect(() => {
    if (prevLocation.current === location) return;
    prevLocation.current = location;
    queueMicrotask(() => {
      setProgress(100);
      setPhase("done");
    });
  }, [location]);

  useEffect(() => {
    if (phase === "nav") {
      const creep = setInterval(() => {
        setProgress((p) => Math.min(90, p + (90 - p) * 0.08));
      }, 200);
      // The brand mark only earns the overlay after the delay — quicker
      // transitions just get the bar.
      const logoTimer = setTimeout(() => setLogoDue(true), LOGO_DELAY_MS);
      const failsafe = setTimeout(() => setPhase("idle"), NAV_FAILSAFE_MS);
      return () => {
        clearInterval(creep);
        clearTimeout(logoTimer);
        clearTimeout(failsafe);
      };
    }
    if (phase === "done") {
      const linger = setTimeout(() => {
        setPhase("idle");
        setProgress(0);
      }, DONE_LINGER_MS);
      return () => clearTimeout(linger);
    }
  }, [phase]);

  const showLogo = phase === "nav" && logoDue;

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 transition-opacity duration-[var(--duration-fast)] motion-reduce:transition-none"
        style={{ opacity: phase === "idle" ? 0 : 1 }}
      >
        <div
          className="h-full bg-primary transition-[width] duration-[var(--duration-quick)] ease-[var(--ease-smooth-out)] motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-40 grid place-items-center bg-background/70 backdrop-blur-[2px] transition-opacity duration-[var(--duration-fast)] motion-reduce:transition-none ${
          showLogo ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* The app icon mark — same car SVG + dark tile as app/icon.tsx. */}
        <div className="grid size-16 animate-pulse place-items-center rounded-2xl bg-box motion-reduce:animate-none">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M3 12l1.5-4.5A2 2 0 0 1 6.4 6h11.2a2 2 0 0 1 1.9 1.5L21 12" />
            <path d="M3 12h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
            <circle cx="7.5" cy="17" r="1.5" fill="currentColor" />
            <circle cx="16.5" cy="17" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>
    </>
  );
}
