type WizardProgressProps = {
  current: number;
  total: number;
};

export function WizardProgress({ current, total }: WizardProgressProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold tracking-widest text-muted uppercase">
        Paso {current} de {total}
      </span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
