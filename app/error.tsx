"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log server-side; never render error.message in production (it can
    // leak sensitive details from Server Component errors).
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="text-sm font-bold tracking-widest text-primary uppercase">
        Error
      </p>
      <h1 className="text-3xl leading-tight font-black tracking-tight uppercase md:text-4xl">
        Algo salió mal.
      </h1>
      <p className="max-w-md text-lg text-muted">
        Tuvimos un problema inesperado. Podés intentar de nuevo o volver al
        inicio.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
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
