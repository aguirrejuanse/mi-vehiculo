import Link, { type LinkProps } from "next/link";
import { type MouseEvent, type ReactNode } from "react";

const SIZE_CLASSES = {
  sm: "px-4 py-2",
  md: "px-5 py-3",
  lg: "px-6 py-3",
} as const;

type LinkButtonProps = LinkProps & {
  children: ReactNode;
  className?: string;
  size?: keyof typeof SIZE_CLASSES;
  /**
   * Skip the text-sm/font-bold/tracking-widest/uppercase classes.
   * Use this when the link sits inside a parent that already sets that
   * text styling (e.g. a row wrapper with `text-xs font-bold uppercase`),
   * so this link doesn't override the inherited size.
   */
  bare?: boolean;
  // Not part of next/link's own LinkProps type, but Link forwards it to the
  // underlying <a> — needed by callers that intercept the click (e.g.
  // lib/landing/smooth-scroll's scrollToHash) to smooth-scroll instead of
  // navigating when the target is on the current page.
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function LinkButton({
  children,
  className,
  size = "sm",
  bare = false,
  ...props
}: LinkButtonProps) {
  const classes = [
    "rounded-xl bg-primary text-white transition-colors hover:bg-primary-hover",
    SIZE_CLASSES[size],
    !bare && "text-sm font-bold tracking-widest uppercase",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link className={classes} {...props}>
      {children}
    </Link>
  );
}
