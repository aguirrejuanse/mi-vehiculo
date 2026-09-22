"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type PointerEvent,
} from "react";
import { Hero } from "@/components/landing/hero";
import type { HeroVariant } from "@/lib/landing/hero-variants";

const ROTATION_INTERVAL_MS = 5000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

// The server snapshots keep the first render identical to the no-JS HTML:
// first variant, rotation "allowed". The client corrects it after hydration.
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

function useDocumentHidden() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false,
  );
}

export function HeroRotator({
  variants,
}: {
  variants: readonly HeroVariant[];
}) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isDocumentHidden = useDocumentHidden();

  const isRunning =
    !prefersReducedMotion &&
    !isDocumentHidden &&
    !isHovered &&
    !hasKeyboardFocus;

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % variants.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isRunning, variants.length]);

  function handlePointerEnter(event: PointerEvent) {
    // Touch taps emit pointerenter with no matching leave until the next tap
    // elsewhere, so only a real mouse pauses on hover.
    if (event.pointerType === "mouse") setIsHovered(true);
  }

  function handleFocus(event: FocusEvent) {
    // Only keyboard focus pauses: a mouse click on the CTA leaves focus
    // behind and would keep the rotation stuck.
    if (event.target.matches(":focus-visible")) setHasKeyboardFocus(true);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHasKeyboardFocus(false);
    }
  }

  return (
    <div
      onPointerEnter={handlePointerEnter}
      onPointerLeave={() => setIsHovered(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <Hero
        variants={variants}
        activeIndex={prefersReducedMotion ? 0 : index}
      />
    </div>
  );
}
