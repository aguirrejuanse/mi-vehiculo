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
      className="mt-2 cursor-pointer rounded-sm bg-rb-red px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-rb-red-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}
