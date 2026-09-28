"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";

// Per-device analytics opt-out — `?analytics=off` on any page persists it,
// `?analytics=on` turns capture back on. Keeps owner test devices out of
// prod metrics; the flag lives in localStorage, so it survives sessions
// and applies to anonymous traffic too (server-side events are filtered
// via PostHog's internal-users setting instead).
const ANALYTICS_OPT_OUT_KEY = "mv:analytics-off";

export function PostHogProvider({ children }: { children: ReactNode }) {
  const initialized = useRef(false);
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: "/_posthog",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      capture_exceptions: true,
    });

    const toggle = new URLSearchParams(window.location.search).get(
      "analytics",
    );
    if (toggle === "off") localStorage.setItem(ANALYTICS_OPT_OUT_KEY, "1");
    if (toggle === "on") localStorage.removeItem(ANALYTICS_OPT_OUT_KEY);
    if (localStorage.getItem(ANALYTICS_OPT_OUT_KEY)) {
      posthog.opt_out_capturing();
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    if (isSignedIn && user) {
      // email lands on the person profile so PostHog's "filter out internal
      // and test users" can exclude the owner account too.
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
      });
    } else {
      posthog.reset();
    }
  }, [isLoaded, isSignedIn, user]);

  return <>{children}</>;
}
