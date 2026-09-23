import Link, { type LinkProps } from "next/link";
import { type ReactNode } from "react";

type ChipLinkProps = LinkProps & {
  active?: boolean;
  count?: number;
  children: ReactNode;
};

export function ChipLink({ active, count, children, ...props }: ChipLinkProps) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors ${
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-surface-border bg-surface text-muted hover:text-foreground"
      }`}
      {...props}
    >
      {children}
      {count != null && <span className="font-semibold">{count}</span>}
    </Link>
  );
}
