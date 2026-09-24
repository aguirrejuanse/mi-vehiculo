import posthog from "posthog-js";

const environment =
  process.env.NEXT_PUBLIC_POSTHOG_ENV ?? process.env.NODE_ENV ?? "unknown";

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, { ...(properties ?? {}), environment });
}

export function identify(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.identify(userId, properties);
}

export function trackError(
  error: unknown,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  if (!posthog.__loaded) return;
  posthog.captureException(error, { ...(properties ?? {}), environment });
}

export function reset() {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.reset();
}

export { posthog };
