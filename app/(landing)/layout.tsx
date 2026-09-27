import { SiteHeader } from "@/components/layout/site-header";

// Static signed-out header: proxy.ts redirects signed-in users to
// /dashboard before these routes render, so this group can prerender
// (any auth() call in the header would make every landing route dynamic).
export default function LandingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader signedOutOnly />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
