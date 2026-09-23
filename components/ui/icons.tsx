import { type SVGProps } from "react";

// Same icon convention as components/landing/benefits.tsx: minimal stroke
// icons, no icon library — 24x24, currentColor, strokeWidth 1.5.
function iconProps(props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

export function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps({ className })}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps({ className })}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function PencilIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps({ className })}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps({ className })}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
