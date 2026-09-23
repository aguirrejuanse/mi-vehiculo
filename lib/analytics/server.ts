import { PostHog } from "posthog-node";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

const analytics = key
  ? new PostHog(key, { host: host || "https://us.i.posthog.com" })
  : null;

export function track(
  event: string,
  properties?: Record<string, unknown>,
  options?: { userId?: string },
) {
  if (!analytics) return;
  analytics.capture({
    distinctId: options?.userId ?? "anonymous",
    event,
    properties,
  });
}
