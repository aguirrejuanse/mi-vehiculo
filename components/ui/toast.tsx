"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
};

// Auto-dismissing status message pinned to the bottom of the viewport. Mount
// it with a changing `key` to restart the timer and animation for a new
// message. `onDismiss` must be referentially stable (e.g. useCallback),
// otherwise every parent re-render restarts the timer.
export function Toast({ message, onDismiss, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="toast fixed bottom-6 left-1/2 z-50 w-max max-w-[calc(100vw-2rem)] rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-lg"
    >
      {message}
    </div>
  );
}
