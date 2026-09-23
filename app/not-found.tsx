import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <h1 className="text-6xl leading-none font-black tracking-tight text-primary md:text-8xl">
        404
      </h1>
      <p className="text-2xl leading-tight font-black tracking-tight uppercase md:text-3xl">
        No encontramos esta página.
      </p>
      <p className="max-w-md text-lg text-muted">
        El enlace puede estar roto o la página puede haberse movido.
      </p>
      <Link
        href="/"
        className="cursor-pointer rounded-2xl bg-primary px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-colors hover:bg-primary-hover"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
