const TONE_CLASSES = {
  ok: "bg-success",
  warn: "bg-accent",
  danger: "bg-danger",
  muted: "bg-muted/40",
} as const;

export type StatusDotTone = keyof typeof TONE_CLASSES;

type StatusDotProps = {
  tone: StatusDotTone;
  /** Accessible label for screen readers (e.g. "Al día"). */
  label: string;
};

export function StatusDot({ tone, label }: StatusDotProps) {
  return (
    <span className="inline-flex items-center">
      <span
        aria-hidden
        className={`size-2 rounded-full ${TONE_CLASSES[tone]}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
