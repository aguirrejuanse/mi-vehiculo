"use server";

import { cookies } from "next/headers";
import {
  isThemeChoice,
  SYSTEM_THEME,
  THEME_COOKIE,
  type ThemeChoice,
} from "@/lib/theme";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

// Why a Server Action and not a Route Handler: any cookie write in a Server
// Action makes Next.js invalidate the client router cache and re-render the
// current route and its layouts on the server (re-running the page queries).
// That extra render is the price for a `data-theme` that can never be
// overwritten by a stale cached layout payload while keeping the cookie
// `httpOnly`. Theme changes are rare and user initiated, so the cost is
// accepted; a `fetch` to a Route Handler would skip the render but leave the
// cached layouts with the old theme.
export async function setThemeAction(choice: ThemeChoice) {
  if (!isThemeChoice(choice)) return;

  const cookieStore = await cookies();

  if (choice === SYSTEM_THEME) {
    cookieStore.delete(THEME_COOKIE);
    return;
  }

  cookieStore.set(THEME_COOKIE, choice, {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}
