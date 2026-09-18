type SubmitButtonProps = {
  isPending: boolean;
  label: string;
  pendingLabel: string;
};

export function SubmitButton({
  isPending,
  label,
  pendingLabel,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="mt-2 cursor-pointer rounded-xl bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}
