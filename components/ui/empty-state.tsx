import { type ReactNode } from "react";

type EmptyStateProps = {
  children: ReactNode;
};

export function EmptyState({ children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-border py-12 text-center">
      {children}
    </div>
  );
}
