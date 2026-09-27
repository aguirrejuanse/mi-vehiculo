import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Sora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import { TopLoader } from "@/components/layout/top-loader";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { SIGN_IN_PATH } from "@/lib/auth/routes";
import { Toaster } from "@/components/ui/toast";
import { SITE_URL, SITE_URL_ORIGIN } from "@/lib/site-url";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const DESCRIPTION = "Llevá el control del mantenimiento de tus vehículos";

export const metadata: Metadata = {
  metadataBase: SITE_URL_ORIGIN,
  title: "Mi Vehículo",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "es_AR",
    title: "Mi Vehículo",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Mi Vehículo",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mi Vehículo",
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#6c5ce7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider signInUrl={SIGN_IN_PATH}>
      <html
        lang="es"
        // Landing sections opt into `snap-start` (see components/landing/*)
        // and rely on this being the scroll container: nothing in the tree
        // sets overflow, so the document itself (this element) is what
        // actually scrolls. `proximity`, not `mandatory`, so long sections
        // (FAQ, the wizard, use-cases) stay freely scrollable.
        // md+ only: on mobile the dynamic browser chrome makes 100vh taller
        // than the visible area, so snapping clips section tops and fights
        // the user's scroll. Without a snap container, `snap-start` is inert.
        className={`${plexSans.variable} ${plexMono.variable} ${sora.variable} h-full antialiased md:snap-y md:snap-proximity`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          {/* useSearchParams inside TopLoader needs a Suspense boundary or
              every page bails out of static rendering. */}
          <Suspense fallback={null}>
            <TopLoader />
          </Suspense>
          {/* No header here: the auth-aware <Show> header would force every
              route dynamic. Route-group layouts render it instead —
              (landing) gets the static signed-out variant, (public) and
              dashboard get the auth-aware one (see site-header.tsx). */}
          <PostHogProvider>{children}</PostHogProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
