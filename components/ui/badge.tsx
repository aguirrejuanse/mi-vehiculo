import { type ComponentProps } from "react";

const TONE_CLASSES = {
  ok: "bg-success-soft text-success",
  warn: "bg-accent-soft text-accent",
  danger: "bg-danger-soft text-danger",
  muted: "bg-surface-2 text-muted",
} as const;

type BadgeProps = ComponentProps<"span"> & {
  tone: keyof typeof TONE_CLASSES;
};

export function Badge({ tone, className, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-widest uppercase ${TONE_CLASSES[tone]} ${className ?? ""}`}
      {...props}
    />
  );
}
