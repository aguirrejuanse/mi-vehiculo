import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Sora } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Toaster } from "@/components/ui/toast";
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

export const metadata: Metadata = {
  title: "Mi Vehículo",
  description: "Llevá el control del mantenimiento de tus vehículos",
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
            <Link
              href="/"
              className="font-display text-sm font-black tracking-widest uppercase"
            >
              Mi <span className="text-primary">Vehículo</span>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-4">
              <Show when="signed-out">
                <SignInButton>
                  <button className="cursor-pointer text-xs font-semibold tracking-wide text-muted transition-colors hover:text-foreground sm:text-sm">
                    Iniciar sesión
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="cursor-pointer rounded-xl bg-primary px-3 py-1.5 text-xs font-bold tracking-wide uppercase text-white transition-colors hover:bg-primary-hover sm:px-4 sm:py-2 sm:text-sm">
                    Crear cuenta
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold tracking-wide uppercase text-muted transition-colors hover:text-foreground sm:text-sm"
                >
                  Dashboard
                </Link>
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
