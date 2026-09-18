# Product Analysis — Mi Vehículo

Análisis de producto: evento core, North Star Metric y métricas de soporte.
Sirve como referencia para priorizar features y, más adelante, instrumentar
analytics. No implica trabajo pendiente por sí solo — ver `docs/ROADMAP.md`
para eso.

## Problema

El usuario se olvida de hacer mantenimiento a sus vehículos (moto, auto,
bici, monopatín) porque no lleva un registro sistemático de uso (horas/km)
ni de qué se hizo la última vez.

## Evento core (Core Event)

**Registrar un mantenimiento a tiempo** — cargar un `maintenanceLog` para un
vehículo, en una fecha/uso anterior o igual al vencimiento calculado
(`lastValue + interval`, o el intervalo calendario si aplica).

Es el evento que prueba que la app cumplió su propósito: el usuario no se
olvidó. Un registro cargado *después* de vencido cuenta como uso de la app,
pero no como éxito del producto — son cosas distintas y conviene medirlas
separado.

## North Star Metric (propuesta)

> **% de vehículos activos sin mantenimiento vencido**, medido semanalmente.

Un vehículo "activo" es uno con al menos un `maintenanceType` cargado y
`usageRatePerWeek` (o equivalente) declarado. "Sin mantenimiento vencido"
significa que ningún `maintenanceType` de ese vehículo superó su umbral
(uso o calendario) sin un log posterior.

Por qué esta y no otra:
- Es una métrica de **resultado**, no de actividad — mide si el problema
  real (olvidarse) se está resolviendo, no cuánto se usa la app.
- Cae a cero si el usuario deja de entrar y sus vehículos se atrasan, así
  que también funciona como proxy de retención genuina (no vanidad).
- Escala naturalmente a los horizontes futuros: en el modelo de grupos
  familiares o de taller, la métrica es la misma pero con más vehículos
  por "cuenta".

Alternativas descartadas:
- *WAU/MAU*: mide apertura de la app, no si el mantenimiento se hizo.
- *Mantenimientos registrados por semana*: es un buen input metric, pero
  no distingue "a tiempo" de "tarde", que es la diferencia que importa.

## Input metrics (funnel)

| Etapa | Métrica | Qué mide |
|---|---|---|
| Adquisición | Sign-ups / semana | Alguien llega y crea cuenta |
| Activación | % de sign-ups que cargan 1 vehículo + 1 tipo de mantenimiento en las primeras 24h | El setup mínimo para que la NSM pueda existir |
| Engagement | Vehículos activos por usuario | Cuánto de su "garage" real vive en la app |
| Retención | % de usuarios con ≥1 log en los últimos 30 días | Uso sostenido, no solo alta inicial |
| Resultado (NSM) | % de vehículos activos sin mantenimiento vencido | Ver arriba |
| Tardanza | Días promedio entre vencimiento y registro (cuando se registra tarde) | Qué tan bien funciona el recordatorio, aunque no sea perfecto |

## Cómo las features futuras mueven la aguja

- **Foto de ticket/presupuesto con IA** → baja fricción de carga → sube
  Activación y Engagement (menos abandono al cargar un mantenimiento).
- **Grupos / vehículo compartido** → más vehículos por "cuenta" →
  Engagement, y probablemente Retención (efecto red familiar).
- **Nivel de nafta en compartidos** → engagement de uso diario, no solo de
  mantenimiento — evento nuevo a definir si se prioriza.
- **`mivehiculo.taller`** → cambia el actor que registra el mantenimiento
  (el taller, no el dueño) — la NSM sigue siendo válida del lado del
  dueño, pero el taller necesita su propia norte (ver nota abajo).
- **Landing con métricas** → no mueve la NSM, pero comunica prueba social
  (vehículos cargados, mantenimientos registrados) para mejorar
  Adquisición.

**Nota sobre el pivot a taller:** cuando eso avance, probablemente necesite
su propia North Star del lado B2B (ej. "% de trabajos facturados
registrados en la app" o "talleres activos con ≥1 cliente cargado por
semana"). No se define acá para no mezclar B2C y B2B prematuramente — ver
`docs/ROADMAP.md`.

## Cómo aplicar esto

- Toda nueva feature del roadmap debería poder explicar qué fila de la
  tabla de arriba mueve, o si crea un evento nuevo que todavía no está
  medido.
- Todavía no hay instrumentación de analytics en el código — esto es un
  marco de referencia, no un dashboard. Cuando se decida instrumentar
  (ej. PostHog, Vercel Analytics), este documento es el punto de partida
  para qué eventos trackear primero: creación de vehículo, creación de
  tipo de mantenimiento, y creación/edición de log (con timestamp de
  vencimiento calculado al momento del log, para poder derivar "a tiempo"
  vs "tarde" retroactivamente).
