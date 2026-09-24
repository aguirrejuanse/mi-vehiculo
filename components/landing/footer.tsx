"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { scrollToHash } from "@/lib/landing/smooth-scroll";

type FooterLink = {
  label: string;
  href: string;
};

const PRODUCT_LINKS: readonly FooterLink[] = [
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Guía completa", href: "/guia" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Casos de uso", href: "#casos-de-uso" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "FAQ", href: "#preguntas-frecuentes" },
];

// /nosotros, /talleres, /privacidad and /terminos don't exist yet (see
// docs/ROADMAP.md item 8 and ANALISIS.md §5 items 13/15) — linking them now
// on purpose, they'll 404 until those pages are built.
const COMPANY_LINKS: readonly FooterLink[] = [
  { label: "Nosotros", href: "/nosotros" },
  { label: "Talleres", href: "/talleres" },
];

const LEGAL_LINKS: readonly FooterLink[] = [
  { label: "Privacidad", href: "/privacidad" },
  { label: "Términos", href: "/terminos" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly FooterLink[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold tracking-widest text-muted uppercase">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            {link.href.startsWith("#") ? (
              <a
                href={link.href}
                onClick={(event: MouseEvent<HTMLAnchorElement>) =>
                  scrollToHash(link.href, event)
                }
                className="text-sm transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Page-scoped footer: app/layout.tsx has no footer slot yet, so this lives
// only on the landing page rather than becoming a global one.
export function Footer() {
  return (
    <footer className="w-full border-t border-surface-border bg-surface-2">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <FooterColumn title="Producto" links={PRODUCT_LINKS} />
          <FooterColumn title="Empresa" links={COMPANY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted">
          <p>© 2026 Mi Vehículo</p>
          <p>Creado por un rider para riders</p>
          <a
            href="https://www.linkedin.com/in/juanseaguirre/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn de Juanse"
            className="w-fit transition-colors hover:text-primary"
          >
            Juanse Aguirre
          </a>
        </div>
      </div>
    </footer>
  );
}
