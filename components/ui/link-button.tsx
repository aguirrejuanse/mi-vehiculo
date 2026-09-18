import Link, { type LinkProps } from "next/link";
import { type ReactNode } from "react";

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
