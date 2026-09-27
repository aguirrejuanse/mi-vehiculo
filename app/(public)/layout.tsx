import { SiteHeader } from "@/components/layout/site-header";

// Auth-aware header: these routes are public but reachable by signed-in
// users (/terminos from the dashboard footer, /ingresar, /nuevo), so the
// header must resolve the session server-side like the root layout did.
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
