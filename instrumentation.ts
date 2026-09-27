import type { Instrumentation } from "next";

// Captures server-side errors (RSC renders, route handlers, server actions)
// that never reach a client error boundary. posthog-node is imported lazily
// so this file stays edge-runtime safe.
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { trackError } = await import("@/lib/analytics/server");
  await trackError(err, {
    properties: {
      path: request.path,
      method: request.method,
      routePath: context.routePath,
      routeType: context.routeType,
      digest:
        typeof err === "object" && err !== null && "digest" in err
          ? String(err.digest)
          : undefined,
    },
  });
};
