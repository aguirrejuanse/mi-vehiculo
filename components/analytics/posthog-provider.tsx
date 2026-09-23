"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";

export function PostHogProvider({ children }: { children: ReactNode }) {
  const initialized = useRef(false);
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key) return;

    posthog.init(key, {
      api_host: host || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);

  useEffect(() => {
    if (!isLoaded || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    if (isSignedIn && user) {
      posthog.identify(user.id);
    } else {
      posthog.reset();
    }
  }, [isLoaded, isSignedIn, user]);

  return <>{children}</>;
}
