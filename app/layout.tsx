import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Sora } from "next/font/google";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { HeaderCta } from "@/components/landing/header-cta";
import { HeaderNav } from "@/components/landing/header-nav";
import { UserEmail } from "@/components/layout/user-email";
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
    <ClerkProvider>
      <html
        lang="es"
        // Landing sections opt into `snap-start` (see components/landing/*)
        // and rely on this being the scroll container: nothing in the tree
        // sets overflow, so the document itself (this element) is what
        // actually scrolls. `proximity`, not `mandatory`, so long sections
        // (FAQ, the wizard, use-cases) stay freely scrollable.
        className={`${plexSans.variable} ${plexMono.variable} ${sora.variable} h-full snap-y snap-proximity antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          {/* Sticky so it stays visible through the landing's snap-scroll
              sections — otherwise the smooth-scroll to an anchor (see
              lib/landing/smooth-scroll.ts) scrolls it out of view, and mobile
              users lose the way back to the top/nav. bg + backdrop-blur so
              content scrolling underneath doesn't show through. */}
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-surface-border bg-background/90 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
            {/* Doubles as the "back to dashboard" link when signed in, so
                there's no separate "Dashboard" link next to the email. */}
            <Show when="signed-out">
              <Link
                href="/"
                className="font-display text-sm font-black tracking-widest uppercase"
              >
                Mi <span className="text-primary">Vehículo</span>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="font-display text-sm font-black tracking-widest uppercase"
              >
                Mi <span className="text-primary">Vehículo</span>
              </Link>
            </Show>
            {/* Anchor links only make sense on the landing page itself — a
                signed-in user is on /dashboard and its subroutes, where
                "Cómo funciona" etc. would just bounce them back to "/". */}
            <Show when="signed-out">
              <HeaderNav />
            </Show>
            <nav className="flex items-center gap-2 sm:gap-4">
              <Show when="signed-out">
                <Link
                  href="/sign-in"
                  className="cursor-pointer text-center text-xs font-semibold tracking-wide text-muted transition-colors hover:text-foreground sm:text-sm"
                >
                  Iniciar sesión
                </Link>
                <HeaderCta />
              </Show>
              <Show when="signed-in">
                <UserEmail />
                <UserButton />
              </Show>
            </nav>
          </header>
          <main className="flex flex-1 flex-col">{children}</main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
