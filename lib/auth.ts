import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SIGN_IN_PATH } from "@/lib/auth/routes";

export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    // Expired/missing session mid-action: send the user back to sign-in
    // instead of blowing up to the nearest error boundary.
    redirect(SIGN_IN_PATH);
  }
  return userId;
}
