# Análisis de competencia — Mi Garage y LookOver

Fecha: 2026-09-21. Fuentes: 76 screenshots (organizados por flujo en
subcarpetas, ver índice abajo), `migarage.app`,
`migarage.app/talleres`, `lookover.app` y el código de Mi Vehículo en `master`.
Los datos de las landings salen de WebFetch (resumidos por un modelo chico);
los textos entre comillas no se re-verificaron contra el HTML salvo H1, meta
y schema.

### Índice de screenshots

| Carpeta | N | Contenido |
|---|---|---|
| `01-inicio/` | 19 | Home / dashboard, tour guiado (1 de 9), activar avisos, cards RTO/seguro/patente, pedir presupuesto desde home |
| `02-gastos/` | 8 | Página de gastos, nuevo gasto fijo, cargar nafta, "otro gasto" (peaje, lavado, multa…) |
| `03-talleres/` | 6 | Directorio de talleres, buscar/filtrar, "proponer taller" |
| `04-vender-auto/` | 2 | Publicación de venta con historial de mantenimiento verificado |
| `05-menu-cuenta/` | 4 | Menú, ajustes del vehículo (editar/archivar/eliminar), perfil de cuenta |
| `06-taller-onboarding/` | 7 | Onboarding B2B del taller (4 pasos + revisión) |
| `07-presupuestos/` | 3 | "Mis presupuestos" y modal de solicitud (VIN opcional) |
| `08-mantenimientos/` | 1 | Timeline de próximos mantenimientos + "agregar mantenimiento realizado" |
| `09-asistente-ia/` | 2 | Chat del asistente ("¿qué le toca al auto?") |
| `10-notificaciones/` | 1 | Centro de notificaciones (tabs por categoría) |
| `11-instagram/` | 11 | Perfil y posts de `@migarage.app` (marketing) |
| `12-onboarding-vehiculo/` | 8 | Alta de vehículo (4 pasos: marca/modelo/año/km) → plan de mantenimiento generado |
| `13-entrevista/` | 4 | "Entrevista de mantenimiento" (7 pasos: lo hice / no me acuerdo / nunca) |

## 1. Conclusión

- **No competimos en amplitud.** Mi Garage tiene catálogo de marcas y modelos,
  plan generado, presupuestos a talleres, gastos, vender/transferir y una app
  iOS. LookOver tiene 100+ features, apps nativas, offline y precios. Con eso
  no se compite en meses.
- **Sí competimos en el cruce que nadie cubre en español:** horas + km +
  calendario ("lo que venga primero") para moto/enduro, con ciclo de vida de
  repuestos, y **crear el vehículo sin cuenta** (guest wizard, ya hecho).
  Mi Garage no tiene horas ni repuestos; LookOver no está en español (soporte
  en español declarado, sin verificar).
- **Lo que más nos falta no es amplitud, es el "wow" del primer minuto:** un
  plan de mantenimiento generado al cargar el vehículo. Hoy el usuario crea el
  vehículo y aterriza en una pantalla vacía. Ese plan depende de **plantillas
  de mantenimiento por tipo/subtipo** (no por modelo): es el activo de
  contenido que más pesa y donde el conocimiento de enduro del dueño nos da
  ventaja.
- **Mi Garage tiene la mejor landing en español; LookOver, la mejor
  narrativa.** Copiamos la estructura, no el contenido, y no inventamos
  números ni testimonios que no tenemos.

## 2. Matriz de features

Leyenda: ✅ tiene · 🟡 parcial · ❌ no tiene · 🔜 planificado en ROADMAP ·
`?` no verificado. "MV" = Mi Vehículo (código en `master`).

### Vehículos y unidades

| Feature | MV | Mi Garage | LookOver |
|---|---|---|---|
| Tipos: auto, moto | ✅ | ✅ | ✅ |
| Bicicleta, monopatín | ✅ | ❌ | 🟡 (bicis/e-bikes; monopatín no visto) |
| Subtipos (moto calle/enduro, bici ruta/enduro/downhill/eléctrica) | ✅ | 🟡 (categorías de moto) | ✅ (muchos tipos de máquina) |
| Medir por **horas** | ✅ | ❌ | ✅ |
| Medir por km | ✅ | ✅ | ✅ |
| Intervalo por calendario | ✅ | 🟡 (fechas aprox. y vencimientos fijos) | ✅ |
| Dual "lo que venga primero" | ✅ | ❌ | ✅ |
| Multi-vehículo | ✅ | ✅ | ✅ (gratis: 1 máquina) |
| Catálogo marca/modelo/año | ❌ | ✅ (40+ marcas auto, 115 motos) | 🟡 (37 plantillas por tipo de máquina) |
| Usar sin cuenta | ✅ (guest wizard) | ❌ | ✅ |

### Plan y cálculo

| Feature | MV | Mi Garage | LookOver |
|---|---|---|---|
| Estado por ítem (ok/pronto/vencido) | ✅ | ✅ | ✅ |
| Plan generado al crear el vehículo | 🔜 | ✅ (17-18 ítems) | ✅ (IA, "42 ítems / 10 categorías") |
| Vista previa del plan sin cuenta (wizard en la home) | ❌ | ✅ (10.000 km, gated con reCAPTCHA) | ❌ (la app no pide cuenta) |
| Fecha estimada ("En 5.000 km · aprox. marzo 2027") | 🔜 (`usageRatePerWeek` se guarda pero no se usa) | ✅ | ? |
| "Qué ya le hiciste" (entrevista 7 pasos, estado "Para verificar") | 🔜 | ✅ | ❌ |
| Dato oficial vs estimado / nivel de confianza | 🔜 | ✅ | ❌ |
| Importar intervalos desde foto del manual | ❌ | ❌ | ✅ (Pro) |
| Guía "cómo hacerlo" (herramientas, repuestos, videos) | ❌ | ❌ | ✅ |

### Historial y repuestos

| Feature | MV | Mi Garage | LookOver |
|---|---|---|---|
| Registros de mantenimiento | ✅ | ✅ | ✅ |
| Historial de ediciones (auditoría, logs inmutables) | ✅ | ? | ✅ |
| Adjuntar comprobante / fotos | ❌ | ✅ | ✅ (3 gratis / 20 Pro) |
| Costo por registro | ❌ | ✅ | ✅ (Pro) |
| Taller en el registro / sello "validado por taller" | ❌ | ✅ | ❌ |
| **Ciclo de vida de repuestos** (wishlist → por instalar → instalado) | ✅ | ❌ (texto libre) | 🟡 (repuestos con garantía) |
| Foto del vehículo | ❌ | ✅ | ✅ |

### Recordatorios y plataforma

| Feature | MV | Mi Garage | LookOver |
|---|---|---|---|
| Push / email / badge | 🔜 (no envía nada hoy) | 🟡 (solo dentro de la app) | ✅ |
| Vencimientos legales (RTO/VTV, seguro, patente) | ❌ | ✅ | ✅ (registro, inspección, garantía) |
| PWA / offline | 🔜 (PWA) | 🟡 (web app + iOS) | ✅ offline-first |
| Apps nativas | ❌ | iOS (Android "próximamente") | iOS, Android, Apple Watch |
| Analytics de producto | 🔜 | ? | ? |

### Extras

| Feature | MV | Mi Garage | LookOver |
|---|---|---|---|
| Gastos y nafta (consumo) | ❌ | ✅ (ARS/US$) | ✅ |
| Importar (CSV, notas) / exportar (CSV, PDF) | ❌ | ❌ | ✅ |
| Vender / transferir con historial verificado | ❌ | ✅ | ✅ (transferencia por QR) |
| Presupuestos a talleres | ❌ | ✅ (sin oferta: directorio vacío) | ❌ |
| Directorio / alta de talleres | 🔜 (H3) | ✅ (moderado) | 🟡 ("Take It In", Pro) |
| Asistente de IA | ❌ | 🟡 (chat sin memoria) | ✅ (Helper, voz, lote) |
| SEO programático por modelo | 🔜 | ✅ (44 guías + ~127 posts) | ✅ (páginas por tipo de máquina) |
| Idiomas | es | es | 16 (español declarado, sin verificar) |
| Precio | gratis (sin definir) | gratis; "funciones avanzadas pagas" a futuro | Free 1 máquina · Pro USD 24.99/año o 99.99 lifetime |

## 3. Qué nos falta y qué conviene implementar

Ordenado por (impacto en activación) ÷ (esfuerzo):

1. **Plantillas de mantenimiento por subtipo** + plan generado al crear
   (con horas para enduro). Es la pieza que habilita el wizard de la home, la
   pantalla "listo", el "Para verificar" y la fecha estimada.
2. **Fecha estimada** usando `usageRatePerWeek` (ya lo capturamos y no lo
   usamos). Esfuerzo bajo, valor alto: "En 12 h · aprox. marzo".
3. **Entrevista "qué ya le hiciste"** opcional, después de guardar. Tres
   estados y "Para verificar" (sin inventar números redondos).
4. **Recordatorios reales** (push/email). Mueve la North Star.
5. **Adjuntos y costo por registro**; luego gastos/nafta.
6. **Archivar/borrar vehículos** y vista de todos los vehículos (sección 6).
7. **Catálogo de modelos** solo cuando haya usuarios que lo pidan.

Fuera de alcance por ahora: marketplace de presupuestos (Mi Garage tiene
0 talleres visibles y aun así le dedica el menú y el CTA), apps nativas,
asistente de IA, tour largo de 9 pasos, tarjetas de "cargá X" apiladas.

## 4. Roadmap de menos a más esfuerzo

**Nivel 0 — Arreglos y base (días)**
- Archivar/borrar vehículos; etiquetas de tipo en español en el dashboard
  (hoy muestra `monopatin`/`bicicleta` crudos).
- Selector y filtros de vehículos (sección 6).
- Metadata, OG, favicon, footer con términos/privacidad/contacto.
- Estado por vehículo en la tarjeta del dashboard (próximo vencimiento).

**Nivel 1 — Landing y activación (1–2 semanas)**
- Landing nueva con las secciones de la sección 5, sin números inventados.
- `usageRatePerWeek` → fecha estimada dual en "Próximos".
- Analytics del funnel (`docs/PRODUCT.md`).

**Nivel 2 — El plan (2–4 semanas)**
- Plantillas por tipo/subtipo (enduro con horas primero).
- Plan generado al crear + pantalla "listo" (N mantenimientos, cuántos "a
  verificar") + wizard con vista previa en la home.
- Entrevista opcional "qué ya le hiciste" y estado "Para verificar".
- Insignia oficial vs estimado en cada intervalo sugerido.

**Nivel 3 — Retención**
- PWA instalable + recordatorios push/email.
- Adjuntos, costo por registro, gastos/nafta.
- Exportar CSV/PDF (confianza: "tus datos son tuyos").

**Nivel 4 — Diferenciación y crecimiento**
- SEO programático (intervalos por modelo, FAQ), guías y changelog.
- Catálogo de modelos con datos oficiales.
- OCR de tickets (H1), vender/transferir con historial verificado.
- Página de talleres como lista de espera; B2B (H3) recién con usuarios.

## 5. Landing: secciones y de dónde salen

Estructura pedida (15 secciones) mapeada a lo que hacen los competidores y a
lo que podemos mostrar **hoy con honestidad**:

| # | Sección | Referencia | Qué mostramos nosotros |
|---|---|---|---|
| 1 | Hero | LookOver "KEEP RIDERS RIDING" (una promesa, dos CTAs); Mi Garage (mockup de celular con "Al día") | H1 con horas + km, mock con "En 12 h · aprox. marzo". CTA "Crear tu vehículo" → `/nuevo`. Hoy el mock dice km, no horas |
| 2 | Wizard con vista previa | Mi Garage "¿Qué auto tenés?" → "próximos 10.000 km", sin registro | Tipo, subtipo, unidad, valor, uso → "próximas 50 h". **Depende de las plantillas (Nivel 2)**; sin ellas sería un mock falso |
| 3 | Qué solucionamos | LookOver "A GUIDE, NOT JUST A LOG" (4 pasos: elegís máquina → cómo la usás → plan → recordatorios) | "Una guía, no una libreta": el mismo relato con horas/km/calendario |
| 4 | Cómo funciona | Mi Garage (3 pasos con mockup) / LookOver (5 pasos, "no account") | 3 pasos: creá el vehículo (sin cuenta) → ves qué toca → registrás y seguís |
| 5 | Plan de mantenimiento | Mi Garage "próximos 10.000 km", tabs Próximos/Historial | Mockup con badge "Próximamente" hasta que exista |
| 6 | Historial | Mi Garage (sellos "Con comprobante / Registro propio") | Lo que ya tenemos: historial de ediciones ("Editado (2)"), registros que no se pierden |
| 7 | Resto de features y futuras | LookOver "EVERYTHING ELSE IT DOES" (Track / Records / Stay covered) | Grilla con badge **Disponible / Pronto**; repuestos (único en el mercado) al frente |
| 8 | Estadísticas | LookOver "YOUR WHOLE GARAGE" (distribución de máquinas) | **Omitir hasta tener datos reales** |
| 9 | Trusted by | LookOver (descargas, testimonios con nombre, prensa) | **Omitir** o beta testers reales con permiso. Sin usuarios, cualquier número sería inventado (ver "Landing con métricas" en el ROADMAP) |
| 10 | Built by a rider | LookOver (foto del fundador, "sigo respondiendo los mails") | La sección más fuerte que tenemos hoy: historia real de enduro y horas |
| 11 | Planes | LookOver (Free / Pro USD 24.99) | "Gratis por ahora"; plan Pro como idea futura, sin precios |
| 12 | FAQ | Ambos (10 preguntas + schema FAQPage) | 8–10 preguntas con schema; aporta SEO |
| 13 | Talleres | Mi Garage `/talleres` (H1 "Conseguí más oportunidades para tu taller", form de alta) | `/talleres` como **lista de espera**, sin prometer clientes. Mi Garage tiene el directorio vacío |
| 14 | How to use | LookOver `/how-to-use-lookover` (no se pudo verificar) | `/como-usar` con capturas paso a paso; sirve también de SEO |
| 15 | Nosotros | Mi Garage `/nosotros`, LookOver `/our-story` | `/nosotros`: quién, por qué, qué viene |

**Secciones que suelen ir y no listaste:**
- Header con navegación y **footer** (legales, contacto, redes): obligatorio
  para el deploy.
- **CTA final** repetido antes del footer.
- **Problema / antes-después** (Mi Garage: "información perdida" vs "un solo
  registro"; nuestro rival real es la planilla y las notas).
- **Casos de uso** ("¿Cuándo te sirve?": después de un service, al comprar
  usado, antes de una salida larga).
- **Privacidad / tus datos** (qué guardamos, exportar, borrar): LookOver lo
  linkea, Mi Garage tiene un disclaimer largo.
- **Comparativa** ("vs planilla / vs otras apps"): LookOver tiene
  `/compare`.
- **Novedades / changelog** (LookOver tiene 33): "build in public" barato.
- **Captura de email / newsletter** (LookOver): útil sin usuarios todavía.
- **Instalación como app** (PWA), en lugar de los badges de tiendas.
- Blog/guías SEO ("cada cuánto cambiar el aceite de X"): Nivel 4.

## 6. App logueada: selector, vistas y archivar/borrar

Hoy `/dashboard` es una grilla de tarjetas sin orden, sin estado, sin
filtro, sin selector y sin archivar/borrar (verificado en el código).

**Selector de vehículos.** Mi Garage lo resuelve con un modal "Elegí un
vehículo": avatar con monograma, nombre, patente y km en monoespaciado, tilde
en el activo. Proponemos lo mismo en la cabecera de la página del vehículo.

**Vistas del dashboard** (chips, estado en la URL, ej. `?vista=`):

| Vista | Contenido |
|---|---|
| Todos | Todos los vehículos activos |
| Motos · Autos y camionetas · Monopatines · Bicis | Filtro por `type`. "Autos y camionetas" es el tipo `auto` (no existe subtipo camioneta) |
| Próximos mantenimientos | Agrega `computeNextDue` de todos los vehículos, ordenado por urgencia. Es la vista que más se parece a lo que pide la North Star |
| Archivados | Solo los archivados, con "Restaurar" |

Mostrar solo los chips de los tipos que el usuario efectivamente tiene.

**Archivar y borrar.**
- *Archivar* (reversible): columna nullable `archivedAt` en `vehicles`;
  fuera de listados y de recordatorios; el historial se conserva (mismo
  texto que usa Mi Garage). Vista "Archivados" para restaurar.
- *Borrar* (definitivo): confirmación escribiendo el nombre; los deletes en
  cascada existen a nivel DB pero **hay que verificarlos antes de exponerlo**.
- Relacionado: hoy tampoco se puede borrar un registro, tipo o repuesto. Como
  los logs son inmutables con historial de ediciones, corresponde definir si
  "borrar" es soft-delete.

## 7. Mi Garage: lo que aprendimos del producto

**Flujo:** cuenta primero → ubicación/teléfono → 4 pasos de vehículo (marca,
modelo, versión, año; patente; combustible; km + uso) → foto opcional →
"Creando tu garage" → "Listo" (17 ítems: 0 te toca pronto / 14 más adelante /
3 a verificar) → timeline → entrevista opcional de 7 pasos. Unas 18–20
interacciones hasta el primer valor, sin contar la cuenta.

**Copiar:** presets de uso con número visible (nosotros con horas); opciones
con la consecuencia en el subtítulo; microcopy de "por qué te lo pido";
"Para verificar" con motivo; aviso para autos usados; fecha dual; insignia
oficial vs estimado; fecha y valor precargados en el modal de registro;
barra fija con dos acciones; resumen con "Editar".

**Evitar:** cuenta antes del valor; tres dropdowns dependientes (usar
combobox con búsqueda y escritura libre); patente obligatoria; tour de 9
pasos; cuatro tarjetas apiladas; "Necesita atención" en rojo el día 1;
"basado en el historial cargado" cuando no hay ninguno; fechas repetidas;
contador "de 4" que no cuenta foto ni entrevista; botón deshabilitado con
bajo contraste; botón fijo que tapa el último campo; marketplace sin oferta.

**Instagram (@migarage.app):** 73 seguidores, 8 posts estáticos, dos
públicos mezclados (conductores y talleres), tono de voseo tranquilo, plantilla
de tarjeta con mockup. Copiar: una idea por tarjeta y detalles locales
(VTV, pesos). Evitar: mezclar públicos. Oportunidad: contenido de horas y
enduro con fotos reales y cadencia semanal.

## 8. Riesgos y pendientes de verificación

- Si Mi Garage o LookOver ven demanda de horas en español, agregarlo les
  cuesta poco; la defensa es la profundidad (repuestos, intervalo dual) y el
  nicho.
- No se pudo verificar: `/faqs`, `/nosotros`, `/red-de-talleres` de Mi
  Garage; `/compare` y `/how-to-use-lookover` de LookOver; el soporte real en
  español de LookOver; las cifras de LookOver (5.000+ descargas, etc.).
- LookOver es inconsistente en su plan gratuito (3 fotos vs 20 archivos) y
  lista un plan de USD 3.99/mes que no aparece en la tarjeta de precios.
- El wizard de Mi Garage usa reCAPTCHA; si mostramos una vista previa sin
  cuenta hay que pensar abuso/costos antes de exponerla.
