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
import { Toaster } from "sonner";
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
        className={`${plexSans.variable} ${plexMono.variable} ${sora.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <header className="flex items-center justify-between border-b border-surface-border px-6 py-4">
            <Link
              href="/"
              className="font-display text-sm font-black tracking-widest uppercase"
            >
              Mi <span className="text-primary">Vehículo</span>
            </Link>
            <nav className="flex items-center gap-4">
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
          <Toaster position="bottom-right" theme="system" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
