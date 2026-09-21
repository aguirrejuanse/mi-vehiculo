"use client";

import { useEffect } from "react";

export type ToastVariant = "success" | "error";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
  durationMs?: number;
};

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "border-success bg-success-soft text-success",
  error: "border-danger bg-danger-soft text-danger",
};

// Auto-dismissing status message pinned to the bottom of the viewport. Mount
// it with a changing `key` to restart the timer and animation for a new
// message. `onDismiss` must be referentially stable (e.g. useCallback),
// otherwise every parent re-render restarts the timer. Errors use
// role="alert" so screen readers announce them immediately.
export function Toast({
  message,
  variant = "success",
  onDismiss,
  durationMs = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`toast fixed inset-x-0 bottom-6 z-50 mx-auto w-max max-w-[calc(100vw-2rem)] rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${VARIANT_CLASSES[variant]}`}
    >
      {message}
    </div>
  );
}
