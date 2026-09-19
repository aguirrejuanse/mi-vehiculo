import type { Metadata } from "next";
import {
  Barlow_Condensed,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Righteous,
  Sora,
} from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { cookies } from "next/headers";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { isTheme, THEME_COOKIE } from "@/lib/theme";
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

// Theme-specific display fonts: not preloaded, so the browser only downloads
// them when a theme actually uses them.
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["700", "800"],
  style: ["italic"],
  preload: false,
});

const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: "400",
  preload: false,
});

// Clerk resolves these CSS variables at runtime (color-mix / relative color
// syntax), so its UI follows the active theme without re-rendering.
const clerkAppearance = {
  variables: {
    colorPrimary: "var(--color-primary)",
    colorDanger: "var(--color-danger)",
    colorSuccess: "var(--color-success)",
    colorWarning: "var(--color-accent)",
    colorNeutral: "var(--foreground)",
    colorForeground: "var(--foreground)",
    colorMutedForeground: "var(--muted)",
    colorBackground: "var(--surface)",
    colorInput: "var(--surface-2)",
    colorInputForeground: "var(--foreground)",
    colorModalBackdrop: "color-mix(in srgb, var(--background) 73%, transparent)",
  },
};

export const metadata: Metadata = {
  title: "Mi Vehículo",
  description: "Llevá el control del mantenimiento de tus vehículos",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isTheme(themeCookie) ? themeCookie : null;

  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html
        lang="es"
        data-theme={theme ?? undefined}
        className={`${plexSans.variable} ${plexMono.variable} ${sora.variable} ${barlowCondensed.variable} ${righteous.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border px-6 py-4">
            <Link
              href="/"
              className="font-display text-sm font-black tracking-widest uppercase"
            >
              Mi <span className="text-primary">Vehículo</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-4">
              <ThemeSwitcher initialTheme={theme} />
              <Show when="signed-out">
                <SignInButton>
                  <button className="cursor-pointer text-sm font-semibold tracking-wide text-muted transition-colors hover:text-foreground">
                    Iniciar sesión
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-bold tracking-wide uppercase text-white transition-colors hover:bg-primary-hover">
                    Crear cuenta
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold tracking-wide uppercase text-muted transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
                <UserButton />
              </Show>
            </nav>
          </header>
          <main className="flex flex-1 flex-col">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
