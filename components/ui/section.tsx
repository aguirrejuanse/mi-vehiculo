import Link, { type LinkProps } from "next/link";
import { type ReactNode } from "react";
import { PlusIcon } from "@/components/ui/icons";

type SectionProps = {
  title: string;
  /** Optional right-aligned header action, e.g. a "+ Repuesto" link. */
  action?: ReactNode;
  /** Grid placement classes when the section lives inside a grid layout. */
  className?: string;
  children: ReactNode;
};

export function Section({ title, action, className, children }: SectionProps) {
  return (
    <section className={`flex flex-col gap-3 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold tracking-widest text-muted uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// The standard right-aligned section action ("+ Repuesto", "+ Registro").
// For row-level links (e.g. "Editar" inside a card) use SectionLink instead.
export function SectionAddLink({
  children,
  ...props
}: LinkProps & { children: string }) {
  return (
    <Link
      aria-label={`Nuevo ${children.toLowerCase()}`}
      className="-m-1.5 inline-flex shrink-0 items-center rounded-full border border-surface-border p-2.5 text-muted transition-colors hover:border-primary hover:text-primary sm:m-0 sm:border-transparent sm:p-0 sm:text-xs sm:font-bold sm:tracking-widest sm:uppercase sm:hover:text-foreground"
      {...props}
    >
      <PlusIcon className="size-4 sm:hidden" />
      <span className="hidden sm:inline">+ {children}</span>
    </Link>
  );
}

// Plain right-aligned link in the section/link style ("Editar", "Editado").
export function SectionLink({
  children,
  ...props
}: LinkProps & { children: ReactNode }) {
  return (
    <Link
      className="shrink-0 text-xs font-bold tracking-widest text-muted uppercase transition-colors hover:text-foreground"
      {...props}
    >
      {children}
    </Link>
  );
}
