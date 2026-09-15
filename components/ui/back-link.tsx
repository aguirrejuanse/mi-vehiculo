import Link, { type LinkProps } from "next/link";
import { type ReactNode } from "react";

type BackLinkProps = LinkProps & {
  children: ReactNode;
};

export function BackLink({ children, ...props }: BackLinkProps) {
  return (
    <Link
      className="text-xs font-bold tracking-widest text-rb-muted uppercase transition-colors hover:text-foreground"
      {...props}
    >
      ← {children}
    </Link>
  );
}
