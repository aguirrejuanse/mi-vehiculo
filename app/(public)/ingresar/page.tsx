import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { PageTitle } from "@/components/ui/page-title";
import { InlineAuthForm } from "@/components/auth/inline-auth-form";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <PageTitle highlight="tu cuenta">Ingresá o creá</PageTitle>
      <InlineAuthForm />
    </div>
  );
}
