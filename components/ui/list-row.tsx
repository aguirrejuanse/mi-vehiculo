import Link, { type LinkProps } from "next/link";
import { type ReactNode } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";

type ListRowProps = LinkProps & {
  leading?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  /** Content rendered between the text block and the chevron (e.g. StatusDot). */
  trailing?: ReactNode;
  className?: string;
};

export function ListRow({
  leading,
  title,
  meta,
  trailing,
  className,
  ...props
}: ListRowProps) {
  return (
    <Link
      className={`group flex items-center gap-3 rounded-2xl border border-surface-border bg-surface px-4 py-3 transition-colors hover:border-primary ${className ?? ""}`}
      {...props}
    >
      {leading}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold">{title}</span>
        {meta ? (
          <span className="truncate text-sm text-muted">{meta}</span>
        ) : null}
      </span>
      {trailing}
      <ChevronRightIcon className="size-4 shrink-0 text-muted transition-colors group-hover:text-primary" />
    </Link>
  );
}
