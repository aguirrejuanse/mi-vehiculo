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
- `app/dashboard/` — área autenticada; lista los vehículos del usuario
  (filtrados por `userId` de Clerk).
- `app/dashboard/vehiculos/nuevo/` — placeholder, falta el formulario real.

## Pendiente

- Formulario de alta de vehículo (`app/dashboard/vehiculos/nuevo`).
- CRUD de tipos de mantenimiento y registro de mantenimientos realizados.
- Cálculo de "próximo mantenimiento" usando `usageRatePerWeek`.
