"use server";

import { cookies } from "next/headers";
import {
  isThemeChoice,
  SYSTEM_THEME,
  THEME_COOKIE,
  type ThemeChoice,
} from "@/lib/theme";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

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
