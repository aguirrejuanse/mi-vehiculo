"use client";

import Image from "next/image";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type PointerEvent,
} from "react";

const ROTATION_INTERVAL_MS = 4000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// zoom + focus: juanse-2 is a full-body trail photo, so a plain object-cover
// crop leaves Juanse tiny in the circle — zoomed in and re-centered on his
// face. juanse-1 was a landscape selfie where a plain cover crop kept the
// full frame height (helmet-to-jacket) and left the face small —
// pre-cropped to a tight face+helmet square in the source file itself
// instead (see assets/photos/IMG_0772.jpg), so no CSS zoom needed.
const PHOTOS = [
  {
    src: "/juanse-1.jpg",
    alt: "Juanse, creador de Mi Vehículo",
    zoom: 1,
    focusX: 50,
    focusY: 50,
  },
  {
    src: "/juanse-2.jpg",
    alt: "Juanse arriba de su moto, en la montaña",
    zoom: 2.2,
    focusX: 50,
    focusY: 32,
  },
] as const;

// Same rotation pattern as hero-rotator.tsx (reduced-motion/visibility/
// hover/focus aware), duplicated rather than shared since this is a much
// smaller, purely decorative rotation (no CTA, no keyboard nav needed beyond
// pausing).
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

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

export function FounderPhotoRotator() {
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
      setIndex((current) => (current + 1) % PHOTOS.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isRunning]);

  function handlePointerEnter(event: PointerEvent) {
    if (event.pointerType === "mouse") setIsHovered(true);
  }

  function handleFocus(event: FocusEvent) {
    if (event.target.matches(":focus-visible")) setHasKeyboardFocus(true);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHasKeyboardFocus(false);
    }
  }

  const activeIndex = prefersReducedMotion ? 0 : index;

  return (
    <div
      className="relative size-32 shrink-0 overflow-hidden rounded-full sm:size-40 lg:size-56"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={() => setIsHovered(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
    >
      {PHOTOS.map((photo, photoIndex) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          fill
          // The circle itself is 128–224px (up to lg), but juanse-2's zoom
          // blows that up ~2.2x via the transform below — asking Next for a
          // source sized only to the container made the zoom pixelate.
          sizes="500px"
          style={{
            objectPosition: `${photo.focusX}% ${photo.focusY}%`,
            transform: `scale(${photo.zoom})`,
            transformOrigin: `${photo.focusX}% ${photo.focusY}%`,
          }}
          className={`object-cover transition-opacity duration-700 ${
            photoIndex === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          priority={photoIndex === 0}
        />
      ))}
    </div>
  );
}
