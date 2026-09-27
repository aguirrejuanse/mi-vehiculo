# Mi Vehículo

App para llevar el control del mantenimiento de tus vehículos (moto, auto,
bicicleta, monopatín) según horas de uso o kilómetros recorridos.

Stack: Next.js 16 (App Router) + TypeScript, Drizzle ORM sobre Neon Postgres
(vía `drizzle-orm/neon-http`), Clerk para autenticación, Tailwind CSS.

## Setup

1. Instalar dependencias:

   ```bash
   pnpm install
   ```

2. Completar `.env.local` (ya existe con placeholders, copiá `.env.local.example`
   si lo recreás):

   - `DATABASE_URL`: connection string de un proyecto en [neon.tech](https://neon.tech)
     (Dashboard → tu proyecto → Connection Details → copiá el string con
     `?sslmode=require`).
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY`: desde
     [dashboard.clerk.com](https://dashboard.clerk.com) → tu app → API Keys.
   - `NEXT_PUBLIC_POSTHOG_KEY` y `NEXT_PUBLIC_POSTHOG_HOST` (opcional): desde
     [app.posthog.com](https://app.posthog.com) → Project settings → API Keys.
     Si no están, los eventos se ignoran silenciosamente; útil para no
     contaminar analytics en desarrollo.

3. Generar y aplicar las migraciones contra tu base de Neon:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

   (`db:push` sincroniza el schema directo sin generar archivos de migración,
   útil en desarrollo temprano. `db:studio` abre Drizzle Studio.)

4. Levantar el servidor de desarrollo:

   ```bash
   pnpm dev
   ```

## Estructura

- `db/schema.ts` — tablas `vehicles`, `maintenanceTypes`, `maintenanceLogs` y
  sus relaciones.
- `db/index.ts` — cliente Drizzle (lazy, no rompe el build si falta
  `DATABASE_URL`).
- `proxy.ts` — protege todo excepto `/` con Clerk (en Next.js 16 reemplaza a `middleware.ts`).
- `app/` — landing pública (`/` y `/[variante]`) y wizard público `/nuevo`.
- `app/dashboard/` — área autenticada; lista los vehículos del usuario
  (filtrados por `userId` de Clerk).
- `app/dashboard/vehiculos/` — alta/edición de vehículos, tipos de
  mantenimiento y registro de mantenimientos realizados, con historial de
  ediciones.
- `lib/analytics/` — helpers `client.ts` y `server.ts` para PostHog, con
  proxy `/_posthog` para evitar bloqueadores.

## Docs

- `docs/ROADMAP.md` — qué falta de v1 y los horizontes futuros (grupos,
  vehículo compartido, taller B2B, etc.).
- `docs/PRODUCT.md` — análisis de producto: evento core, North Star
  Metric y métricas de soporte.
- `docs/analytics-events.md` — mapa de eventos PostHog y cómo alimentan
  las métricas de producto.
- `docs/competidores/` — investigación de competencia (Mi Garage,
  LookOver); alimenta las decisiones del roadmap.

## Seguimiento del trabajo

El backlog ejecutable vive en **GitHub Issues**, organizado por milestone:

- [Milestone "v1 — Lanzamiento"](https://github.com/aguirrejuanse/mi-vehiculo/milestone/1)
  — todo lo que falta para abrir el producto a usuarios reales.
- Issues sin milestone = post-lanzamiento (horizontes 1+).

División de responsabilidades:

- **`docs/ROADMAP.md`** = estrategia y contexto (el *por qué* y el orden).
- **GitHub Issues** = tasks accionables (el *qué* concreto, con criterios
  de done). Cada issue del milestone referencia al ítem del roadmap que
  lo origina.
- **Engram (memoria de sesiones)** = decisiones, specs SDD y gotchas
  técnicos (el *registro histórico* de lo que ya se pensó/discutió).

Regla de uso: si una task se puede hacer, es un issue; si es una idea o
decisión de producto, va al ROADMAP; si es contexto de una sesión, a
engram.
