import { type ComponentPropsWithoutRef, type ElementType } from "react";

const PADDING_CLASSES = {
  sm: "p-4",
  md: "p-6",
} as const;

type CardOwnProps<T extends ElementType> = {
  as?: T;
  padding?: keyof typeof PADDING_CLASSES;
};

type CardProps<T extends ElementType> = CardOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps<T>>;

export function Card<T extends ElementType = "div">({
  as,
  padding = "sm",
  className,
  ...props
}: CardProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={`rounded-2xl border border-surface-border bg-surface shadow-sm ${PADDING_CLASSES[padding]} ${className ?? ""}`}
      {...props}
    />
  );
}
