"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  // Unlike `reset` (clears the client boundary state without re-fetching),
  // `retry` re-fetches and re-renders the segment — the one that actually
  // recovers from a transient server-side failure (e.g. a Neon/Clerk blip).
  retry: () => void;
}) {
  useEffect(() => {
    // Log server-side; never render error.message in production (it can
    // leak sensitive details from Server Component errors).
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <h1 className="text-6xl leading-none font-black tracking-tight text-primary md:text-8xl">
        Error
      </h1>
      <p className="text-2xl leading-tight font-black tracking-tight uppercase md:text-3xl">
        Algo salió mal.
      </p>
      <p className="max-w-md text-lg text-muted">
        Tuvimos un problema inesperado. Podés intentar de nuevo o volver al
        inicio.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => retry()}
          className="cursor-pointer rounded-2xl bg-primary px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-colors hover:bg-primary-hover"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-muted transition-colors hover:text-foreground"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
