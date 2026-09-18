import { type ReactNode } from "react";

type PageTitleProps = {
  children: ReactNode;
  highlight: ReactNode;
};

export function PageTitle({ children, highlight }: PageTitleProps) {
  return (
    <h1 className="text-2xl font-black tracking-tight uppercase">
      {children} <span className="text-primary">{highlight}</span>
    </h1>
  );
}
