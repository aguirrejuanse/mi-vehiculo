import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <header className="flex items-center justify-between border-b border-surface-border px-6 py-4">
            <Link
              href="/"
              className="text-sm font-black tracking-widest uppercase"
            >
              Mi <span className="text-rb-red">Vehículo</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Show when="signed-out">
                <SignInButton>
                  <button className="cursor-pointer text-sm font-semibold tracking-wide text-rb-muted transition-colors hover:text-foreground">
                    Iniciar sesión
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="cursor-pointer rounded-sm bg-rb-red px-4 py-2 text-sm font-bold tracking-wide uppercase text-white transition-colors hover:bg-rb-red-hover">
                    Crear cuenta
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold tracking-wide uppercase text-rb-muted transition-colors hover:text-foreground"
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
