import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection } from "@/components/legal/legal-section";

export const metadata: Metadata = {
  title: "Términos — Mi Vehículo",
  description:
    "Condiciones de uso de Mi Vehículo: qué es el servicio, qué no es, y tus responsabilidades.",
};

export default function TerminosPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-16 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Términos de uso
        </h1>
        <p className="text-sm text-muted">
          Última actualización: septiembre de 2026
        </p>
      </header>

      <LegalSection title="Qué es Mi Vehículo">
        <p>
          Una herramienta para registrar el mantenimiento de tus vehículos y
          estimar próximos vencimientos según el uso que declarás (horas,
          kilómetros o calendario).
        </p>
      </LegalSection>

      <LegalSection title="Qué no es">
        <p>
          No somos mecánicos ni reemplazamos el manual de tu vehículo. Los
          vencimientos que calcula la app son <em>estimaciones</em> basadas en
          los datos que cargás: si tu ritmo de uso real difiere del declarado,
          la fecha estimada también va a diferir. La decisión de cuándo hacer
          un mantenimiento es siempre tuya.
        </p>
      </LegalSection>

      <LegalSection title="Tu cuenta">
        <p>
          Sos responsable de las credenciales de tu cuenta y de lo que se
          cargue desde ella. Podés eliminar tu cuenta en cualquier momento
          desde el perfil: eso borra tus vehículos, registros y datos
          asociados de forma permanente.
        </p>
      </LegalSection>

      <LegalSection title="Tus datos">
        <p>
          Lo que cargás es tuyo. No reclamamos propiedad sobre tu contenido y
          podés llevártelo o borrarlo cuando quieras. Cómo lo tratamos está en
          la{" "}
          <Link
            href="/privacidad"
            className="text-primary underline underline-offset-2 transition-colors hover:text-primary-hover"
          >
            política de privacidad
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Uso aceptable">
        <p>
          Nada de abusar del servicio: sin scraping automatizado, sin intentar
          acceder a datos de otros usuarios, sin usar la app para algo ilegal.
          Si una cuenta incumple esto, podemos suspenderla.
        </p>
      </LegalSection>

      <LegalSection title="Disponibilidad">
        <p>
          El servicio se ofrece &quot;tal cual&quot;. Trabajamos para que
          esté disponible y los recordatorios lleguen a tiempo, pero no
          garantizamos uptime ininterrumpido ni entrega perfecta de cada
          notificación. No uses la app como única fuente de verdad para
          mantenimientos críticos de seguridad.
        </p>
      </LegalSection>

      <LegalSection title="Cambios al servicio y a estos términos">
        <p>
          Podemos modificar funcionalidades o estos términos; si el cambio es
          sustancial, lo avisamos en la app. Seguir usando el servicio después
          de la fecha de vigencia implica aceptarlos.
        </p>
      </LegalSection>

      <LegalSection title="Contacto">
        <p>
          Dudas o reclamos:{" "}
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
