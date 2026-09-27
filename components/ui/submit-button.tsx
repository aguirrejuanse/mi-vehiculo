type SubmitButtonProps = {
  isPending: boolean;
  label: string;
  pendingLabel: string;
  // Extra disable on top of isPending — e.g. the suggested-plan submit,
  // which is meaningless with zero rows checked.
  disabled?: boolean;
};

export function SubmitButton({
  isPending,
  label,
  pendingLabel,
  disabled,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending || disabled}
      className="mt-2 cursor-pointer rounded-xl bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition duration-[var(--duration-quick)] enabled:active:scale-[0.98] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}
