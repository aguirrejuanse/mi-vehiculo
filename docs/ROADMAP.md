# Roadmap — Mi Vehículo

Este documento separa lo que **ya es v1** (en curso o confirmado) de lo que
es **futuro**: ideas discutidas, priorizadas por horizonte, pero sin
comprometer trabajo hasta que se retomen explícitamente. Ver también
`docs/PRODUCT.md` para el marco de North Star / métricas que justifica el
orden.

## V1 — Camino al lanzamiento

Hoy no hay usuarios reales: el objetivo es terminar el producto y
lanzarlo. Ejecutando de a PRs chicos sobre `master`.

**Hecho**

1. ✅ Navegación (BackLink consistente en todas las pantallas)
2. ✅ Inmutabilidad de logs → historial de ediciones (`maintenance_log_edits`)
3. ✅ Componentes UI compartidos (`BackLink`/`LinkButton`/`Card`/
   `PageTitle`/`DateField`)
4. ✅ Restyle visual (tema indigo/lavanda + Sora/IBM Plex) — PR #8
5. ✅ Modelo de datos v2: intervalo dual (uso y/o calendario), subtipos
   de vehículo (moto y bicicleta), repuestos con transiciones de estado
   — PR #14 y #15 cierran el plan
6. ✅ Guest wizard: `/nuevo` público, email + código de Clerk recién en
   "confirmar", sign-in inline para cuentas existentes, toasts — PR #16

**Pre-lanzamiento (en este orden)**

7. ⏸️ **Nombre y dominio** (pospuesto, 2026-09-21): se sigue con
   "Mi Vehículo" como nombre de trabajo y se renombra más adelante. No
   bloquea la landing. `mivehiculo.com` está ocupado; a futuro podría
   vivir bajo Andes Riders (subdominio). Descartados: `cuandotoca`,
   `autofy`, `puestaapunto`, `elgaraje`, `motorcheck`. Candidatos si se
   retoma (RDAP 2026-09-21): `fierrero` (`.com` y `.app` libres),
   `fierreros.app`, `garagear.app`. Riesgos: "fierro" también es arma en
   lunfardo; "garaje" se parece a Mi Garage. Pendiente: marcas
   registradas, `.com.ar` y handles. "Vehículo" es término de flotas:
   nadie lo busca así (SEO: usar moto/enduro/service en títulos).
8. ⬜ **Preparar deploy**: dominio propio, instancia de producción de
   Clerk (email-code-only sign-up + "Email verification code" en
   Sign-in options), variables de entorno y rama de DB de producción,
   páginas de términos y privacidad, metadata/OG, monitoreo de errores.
9. ⬜ **Analytics**: instrumentar el funnel de `docs/PRODUCT.md`
   (visita → wizard iniciado → wizard completado → cuenta creada → primer
   mantenimiento). Sin esto no se puede iterar la landing.
10. ⬜ **PWA** (decidido): manifest, service worker, instalable en mobile.
    Es también lo que habilita notificaciones push para recordatorios.
11. ⬜ **Recordatorios de mantenimiento** (push y/o email): es lo que
    mueve la North Star. Verificar el alcance actual antes de diseñar.
11b. ✅ **Análisis de competencia**: Mi Garage (`migarage.app`, Argentina,
    solo km y meses, sin horas) y LookOver (`lookover.app`, el más
    cercano funcionalmente: horas + km + calendario). Los 76 screenshots
    están revisados. Matriz de features, gaps, roadmap por esfuerzo, plan
    de landing y specs de la app logueada en
    `docs/competidores/mi-garage/ANALISIS.md`.
11c. ⬜ **Archivar/borrar vehículos + selector y vistas** (todos, por
    tipo, próximos mantenimientos, archivados). Hoy el dashboard no tiene
    ninguno. Ver `ANALISIS.md` sección 6.
11d. ⬜ **Plantillas de mantenimiento por subtipo + plan generado al
    crear** (horas primero para enduro). Habilita wizard con vista
    previa, "para verificar" y fecha estimada (`usageRatePerWeek` ya se
    guarda y no se usa). Ver `ANALISIS.md` secciones 3 y 4. Habilitaría
    también un "plan inicial" para vehículos usados (idea de Mi Garage,
    2026-09-22: cargar un usado sin saber el historial previo y que la
    app sugiera revisiones para arrancar prolijo).
12. ⬜ **Landing, CTA y growth**: rehacer la landing con las 15 secciones
    de `ANALISIS.md` sección 5 (sin métricas ni testimonios inventados),
    más `/talleres` como lista de espera, `/como-usar` y `/nosotros`.
    Ver preguntas abiertas abajo. Decidido (2026-09-21): offroad primero;
    hero "Todo lo que tu vehículo necesita en una app" con lista de
    mantenimientos de ejemplo a la derecha y `<VehicleWizard />` embebido
    debajo (el CTA scrollea a él); una variante de hero por vehículo (8),
    primero la genérica; base de componentes HyperUI (MIT), hero "Left
    with image". Home (orden inspirado en contiant.com): nav, hero rotativo,
    3 beneficios, banner de dolor, wizard, cómo funciona,
    features con badges Disponible/Pronto, "un garaje para todo" (8
    tarjetas que linkean a `/{slug}`), hecho por un rider, FAQ, CTA final,
    footer. Sin testimonios, métricas ni planes. Los intervalos confirmados están en
    engram (`landing/hero-maintenance-numbers`).
13. 🔄 Tests automatizados: Vitest ya configurado con tests de
    validación y auth; ampliar cobertura de los flujos críticos.
14. ⬜ Carga de tickets con OCR vía vision-LLM (mantenimiento, no compra
    — ver Horizonte 1)

**Después del lanzamiento (no bloquea)**

- Modelo 3D del vehículo con three.js (sin scope; acotar el tiempo si se
  hace, es lo que menos mueve la North Star).
- Monetización: primero retención y datos reales. Hipótesis a validar:
  el dinero está en talleres (Horizonte 3), no en cobrar al dueño
  individual.

### Posicionamiento y aprendizajes de la competencia

- **Posicionar en moto y enduro primero**, en español: horas + km +
  calendario ("lo que venga primero"), ciclo de repuestos, un garaje
  para todo, PWA. Ningún competidor visto combina esto en español.
- **Adoptar de Mi Garage:** plan de mantenimiento generado al cargar el
  vehículo; wizard "qué ya le hiciste" con tres estados (lo hice y a qué
  km / no me acuerdo / nunca) y estado "para verificar"; fecha dual
  ("En 15 h · aprox. marzo"); insignia de dato oficial vs estimado;
  resumen con "Editar"; escape hatches ("estimalo por mí"); SEO
  programático por modelo con tabla de intervalos y FAQ.
- **Evitar:** cuenta obligatoria antes de ver valor (nuestra ventaja es
  el guest wizard), tours largos, tarjetas de aviso apiladas, funciones
  de marketplace sin oferta, estado solo por color, fugas de idioma.
- **Riesgo:** agregar horas es trivial para ellos si ven demanda; la
  defensa es la profundidad (repuestos, intervalo dual) y el nicho.
- **Idea derivada:** paso opcional "qué ya le hiciste" después de
  guardar el vehículo (no antes, para no romper el guest wizard).

### Preguntas abiertas de landing y growth

- ¿Para quién es el mensaje principal: dueño de moto/enduro (horas de
  uso) o cualquier vehículo? Hoy el diferencial real es medir por horas
  y kilómetros.
- ¿Wizard en la home o CTA a `/nuevo`? Decidir con datos de conversión,
  no antes.
- Prueba social sin usuarios todavía: qué mostrar honestamente (ver
  "Landing con métricas" en Horizonte 1).
- Canales de adquisición iniciales (comunidades de enduro/motos, SEO por
  "cada cuánto cambiar el aceite de X", etc.).

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
- **Idea abierta (2026-09-22, sin definir):** además de cobrarle al
  taller, un plan Pro para el usuario individual con vehículos
  ilimitados (el free tier tendría un límite, ej. 3 de cada tipo — sin
  decidir todavía). Matiza la hipótesis de arriba ("el dinero está en
  talleres, no en el dueño individual"): habría que validar las dos
  antes de comprometer un límite en la FAQ o en el producto.

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
