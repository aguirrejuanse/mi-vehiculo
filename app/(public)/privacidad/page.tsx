import type { Metadata } from "next";
import { LegalSection } from "@/components/legal/legal-section";

export const metadata: Metadata = {
  title: "Privacidad — Mi Vehículo",
  description:
    "Qué datos guardamos, para qué los usamos y cómo ejercer tus derechos.",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-16 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Privacidad
        </h1>
        <p className="text-sm text-muted">
          Última actualización: septiembre de 2026
        </p>
      </header>

      <LegalSection title="Qué datos guardamos">
        <p>
          <strong className="font-semibold text-foreground">Cuenta:</strong> tu
          dirección de email, gestionada por Clerk (nuestro proveedor de
          autenticación). Nunca vemos ni guardamos tu contraseña.
        </p>
        <p>
          <strong className="font-semibold text-foreground">
            Contenido que cargás:
          </strong>{" "}
          vehículos, tipos de mantenimiento, registros, repuestos y cualquier
          dato que ingresés en la app.
        </p>
        <p>
          <strong className="font-semibold text-foreground">
            Uso de la app:
          </strong>{" "}
          eventos de navegación y uso (qué pantallas se visitan, qué acciones
          se completan) recolectados con PostHog, servidos a través de un proxy
          propio en nuestro dominio.
        </p>
      </LegalSection>

      <LegalSection title="Para qué los usamos">
        <p>
          Los datos de tus vehículos existen para darte el servicio: historial,
          cálculo de próximos vencimientos y recordatorios. Los eventos de uso
          nos ayudan a entender qué funciona y qué no, para mejorar el
          producto.
        </p>
        <p>
          No vendemos datos, no mostramos publicidad y no usamos tu contenido
          para entrenar modelos.
        </p>
      </LegalSection>

      <LegalSection title="Con quién los compartimos">
        <p>Solo con los proveedores que hacen funcionar la app:</p>
        <ul className="list-disc pl-5">
          <li>
            <strong className="font-semibold text-foreground">Clerk</strong> —
            autenticación y gestión de cuentas.
          </li>
          <li>
            <strong className="font-semibold text-foreground">Neon</strong> —
            base de datos Postgres donde vive tu contenido.
          </li>
          <li>
            <strong className="font-semibold text-foreground">Vercel</strong> —
            hosting de la aplicación.
          </li>
          <li>
            <strong className="font-semibold text-foreground">PostHog</strong> —
            analytics de producto.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          Usamos las cookies estrictamente necesarias para mantener tu sesión
          (Clerk) y una cookie de analytics (PostHog). No hay cookies
          publicitarias ni de terceros ajenos al servicio.
        </p>
      </LegalSection>

      <LegalSection title="Cuánto tiempo los guardamos">
        <p>
          Mientras tengas cuenta. Si la eliminás, tus datos se borran de
          nuestra base (ver Términos, sección &quot;Tu cuenta&quot;).
        </p>
      </LegalSection>

      <LegalSection title="Tus derechos">
        <p>
          Podés acceder, corregir o eliminar tus datos en cualquier momento:
          la mayoría se edita directo en la app, y la baja completa se hace
          eliminando tu cuenta desde el perfil. Para cualquier otra solicitud,
          escribinos.
        </p>
      </LegalSection>

      <LegalSection title="Cambios a esta política">
        <p>
          Si cambia algo sustancial, lo avisamos en la app antes de que entre
          en vigencia. La versión vigente es siempre la publicada en esta
          página.
        </p>
      </LegalSection>

      <LegalSection title="Contacto">
        <p>
          Cualquier duda sobre privacidad:{" "}
          <a
            href="mailto:hola@mi-vehiculo.com"
            className="text-primary underline underline-offset-2 transition-colors hover:text-primary-hover"
          >
            hola@mi-vehiculo.com
          </a>
        </p>
      </LegalSection>
    </div>
  );
}
