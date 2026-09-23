"use client";

import { useUser } from "@clerk/nextjs";

// Shown next to <UserButton/> in the signed-in header — the bare avatar on
// its own gave no clue who's logged in without opening the menu.
export function UserEmail() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email) return null;

  return (
    <span className="hidden text-xs font-semibold tracking-wide text-muted sm:inline">
      {email}
    </span>
  );
}
