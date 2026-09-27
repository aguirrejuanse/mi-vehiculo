import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { HeaderCta } from "@/components/landing/header-cta";
import { HeaderNav } from "@/components/landing/header-nav";
import { UserEmail } from "@/components/layout/user-email";
import { SIGN_IN_PATH } from "@/lib/auth/routes";

// Sticky so it stays visible through the landing's snap-scroll sections —
// otherwise the smooth-scroll to an anchor (see lib/landing/smooth-scroll.ts)
// scrolls it out of view, and mobile users lose the way back to the top/nav.
// bg + backdrop-blur so content scrolling underneath doesn't show through.
const HEADER_CLASSES =
  "sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-surface-border bg-background/90 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4";

const LOGO_CLASSES =
  "font-display text-sm font-black tracking-widest uppercase";

// `signedOutOnly` renders the public variant without calling auth() — for
// the (landing) group, where proxy.ts already redirects signed-in users to
// /dashboard. Any server-side auth read here (the <Show> branches below)
// would make every route under the layout dynamic and force a server render
// on each client-side nav.
export function SiteHeader({ signedOutOnly = false }: { signedOutOnly?: boolean }) {
  if (signedOutOnly) {
    return (
      <header className={HEADER_CLASSES}>
        <Link href="/" className={LOGO_CLASSES}>
          Mi <span className="text-primary">Vehículo</span>
        </Link>
        <HeaderNav />
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href={SIGN_IN_PATH}
            className="cursor-pointer text-center text-xs font-semibold tracking-wide text-muted transition-colors hover:text-foreground sm:text-sm"
          >
            Iniciar sesión
          </Link>
          <HeaderCta />
        </nav>
      </header>
    );
  }

  return (
    <header className={HEADER_CLASSES}>
      {/* Doubles as the "back to dashboard" link when signed in, so there's
          no separate "Dashboard" link next to the email. */}
      <Show when="signed-out">
        <Link href="/" className={LOGO_CLASSES}>
          Mi <span className="text-primary">Vehículo</span>
        </Link>
      </Show>
      <Show when="signed-in">
        <Link href="/dashboard" className={LOGO_CLASSES}>
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
            href={SIGN_IN_PATH}
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
  );
}
