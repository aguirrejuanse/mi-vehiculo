# Roadmap — Mi Vehículo

Este documento separa lo que **ya es v1** (en curso o confirmado) de lo que
es **futuro**: ideas discutidas, priorizadas por horizonte, pero sin
comprometer trabajo hasta que se retomen explícitamente. Ver también
`docs/PRODUCT.md` para el marco de North Star / métricas que justifica el
orden.

## V1 (en curso)

Orden confirmado, ejecutando de a PRs chicos sobre `master`:

1. ✅ Navegación (BackLink consistente en todas las pantallas)
2. ✅ Inmutabilidad de logs → rediseñado como historial de ediciones
   (`maintenance_log_edits`)
3. ✅ Componentes UI compartidos (`BackLink`/`LinkButton`/`Card`/
   `PageTitle`/`DateField`)
4. 🔄 Restyle visual (tema indigo/lavanda + Sora/IBM Plex) — PR #8, en
   review
5. ⬜ Modelo de datos v2:
   - Intervalo dual en `maintenanceTypes` (uso Y/O calendario, el que
     venza primero)
   - Subtipos de vehículo extendidos a bicicleta (Ruta/Enduro/
     Downhill/Eléctrica), cada uno con su unidad y lista de
     mantenimientos sugeridos; tipo/subtipo bloqueado post-creación
   - Entidad **repuestos**: Wishlist → Pendiente de instalar → Instalado
     (opcionalmente linkeado a un log)
6. ⬜ Tests automatizados
7. ⬜ Feature de carga de tickets con OCR vía vision-LLM (mantenimiento,
   no compra — ver distinción en Horizonte 1 abajo)
8. ⬜ Modelo 3D del vehículo con three.js (sin scope definido todavía)

Todo lo de acá abajo es **posterior a v1** — no se empieza sin pedido
explícito.

## Horizonte 1 — Bajar fricción de carga (individual)

Sigue siendo un producto para un solo dueño por vehículo. El objetivo es
que cargar un mantenimiento cueste menos, para subir Activación/Engagement
(ver `docs/PRODUCT.md`).

- **Foto de ticket/presupuesto → recurso con IA**: sacale una foto a un
  ticket de taller o un presupuesto, y que un vision-LLM extraiga
  vehículo, tipo de mantenimiento, valor (km/horas), fecha y costo, y
  precargue el formulario en vez de tipearlo. Mismo enfoque de OCR ya
  decidido para la feature de v1 (ítem 7 arriba) — probablemente sea la
  misma pieza de infraestructura, conviene diseñarlas juntas cuando se
  retomen.
- **Landing con métricas**: mostrar en la landing números tipo "X
  vehículos cargados", "Y mantenimientos registrados" como prueba social.
  Requiere una query agregada pública (sin exponer datos por usuario) y
  pensar cache/revalidación para no pegarle a la DB en cada visita
  anónima.

## Horizonte 2 — Colaborativo / familiar

Rompe el supuesto "un vehículo = un dueño" que hoy está en el modelo de
datos (`vehicles.userId`). Es un cambio de modelo, no solo de UI — pensar
permisos (ver/editar) antes de tocar schema.

- **Grupos**: crear un grupo (ej. "Aguirre") con varios usuarios Clerk,
  donde los vehículos del grupo son visibles (y editables, a definir el
  nivel de permiso) para todos los miembros. Candidato natural para
  **Clerk Organizations**, que ya es el mecanismo elegido para el
  Horizonte 3 (taller) — si se hace grupos primero, conviene diseñar el
  esquema de organización pensando en reusarlo para taller, y viceversa.
- **Vehículo compartido (2 dueños)**: caso más chico que grupos completos
  — un vehículo con más de un `userId` con acceso. Podría ser la base
  técnica de grupos (tabla de permisos por vehículo) en vez de una
  feature separada — evaluar cuál construir primero cuando se retome,
  probablemente compartir-1-vehículo sea el caso base y grupos una capa
  arriba.
- **Nivel de nafta para compartidos**: tiene sentido sobre todo en
  vehículos compartidos (para coordinar "¿quién carga nafta?"). Evento
  nuevo, no es un mantenimiento — pensar si vive en la misma tabla de
  logs o es su propio recurso.

## Horizonte 3 — B2B: `mivehiculo.taller`

Pivot ya discutido y guardado en memoria de sesiones previas (ver
decisión "Taller SaaS pivot"): un **owner** (taller) gestiona N
**clientes**, cada uno con sus vehículos, y el taller registra el trabajo
con costo asociado.

- Tenancy vía **Clerk Organizations** (el taller = un Org).
- Billing **no** vía Clerk Billing (solo soporta Stripe/USD) — integración
  directa con **Mercado Pago** (ARS), elegida a propósito para aprender la
  integración, no como atajo.
- Modelo de datos: `owners` (backed by Clerk orgId) / `clients` /
  `vehicles.clientId`.
- Probablemente necesite su propia North Star del lado B2B — no se define
  todavía para no mezclar B2C/B2B antes de tiempo (ver nota en
  `docs/PRODUCT.md`).
- Es el horizonte con más riesgo de negocio (cobrar a talleres reales), así
  que conviene validarlo con conversaciones/demos antes de invertir en
  billing.

## Cómo se relacionan los horizontes

No son estrictamente secuenciales, pero hay dependencias técnicas a tener
en cuenta cuando se prioricen:

- H1 (foto+IA) es independiente del resto — se puede hacer en cualquier
  momento sin tocar el modelo de dueño.
- H2 (grupos/compartido) y H3 (taller) comparten la necesidad de un
  esquema de "organización" con miembros y permisos — vale la pena no
  diseñarlos en el vacío uno del otro aunque se construyan en momentos
  distintos.
- H3 es el único horizonte que cambia el modelo de negocio (de personal a
  B2B pago) — separarlo claramente evita que decisiones de UX pensadas
  para "mi familia" contaminen decisiones pensadas para "un taller que me
  paga".
