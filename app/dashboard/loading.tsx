// Skeleton for dashboard navigations — keeps the perceived layout stable
// while Neon/Clerk warm up (cold starts otherwise look frozen).
export default function Loading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10"
    >
      <div className="h-9 w-48 animate-pulse rounded-2xl bg-surface-2" />
      {[0, 1].map((group) => (
        <div key={group} className="flex flex-col gap-3">
          <div className="h-5 w-28 animate-pulse rounded-full bg-surface-2" />
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="h-20 animate-pulse rounded-2xl border border-surface-border bg-surface"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
