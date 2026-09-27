# Mapa de eventos de analytics

Referencia cruzada entre los eventos instrumentados en `lib/analytics/`, los flujos de usuario y las métricas de producto definidas en [`docs/PRODUCT.md`](./PRODUCT.md).

## Eventos instrumentados

| Evento | Origen | Props clave | Qué mide |
|---|---|---|---|
| `wizard_started` | Cliente (`/`, `/[variante]`, `/nuevo`, `/dashboard/vehiculos/nuevo`) | `is_signed_in`, `source` (`landing` / `public` / `dashboard`), `environment` | Intención de onboarding |
| `wizard_step_completed` | Cliente | `step`, `source`, `environment` | Avance en el wizard |
| `account_created` | Cliente (verificación de guest) | `source`, `environment` | Sign-up |
| `wizard_completed` | Server (`createVehicleAction`) | `vehicle_type`, `has_usage_rate`, `has_engine`, `source`, `environment` | Vehículo creado |
| `maintenance_type_created` | Server | `vehicle_id`, `has_interval_value`, `has_calendar_interval`, `source` (`manual` o `suggested` — plan de la pantalla "listo"), `environment` | Setup completo para mantenimientos |
| `maintenance_log_created` | Server | `vehicle_id`, `maintenance_type_id`, `computed_due_at`, `is_overdue`, `days_overdue`, `usage_overdue`, `trigger`, `environment` | Core event: usuario registró un mantenimiento |
| `maintenance_log_edited` | Server | `vehicle_id`, `log_id`, `environment` | Corrección de un log |
| `vehicle_archived` | Server | `vehicle_id`, `environment` | Vehículo sale del garage activo |
| `vehicle_restored` | Server | `vehicle_id`, `environment` | Vehículo vuelve a activo |

## Workflows esperados

1. **Adquisición**: `/` → `wizard_started` (`source=landing`) → `wizard_step_completed` → `account_created` → `wizard_completed`.
2. **Activación en 24h**: `account_created` → `wizard_completed` < 24h → `maintenance_type_created` < 24h.
3. **Retención a 30 días**: usuario con al menos un `maintenance_log_created` en los últimos 30 días.
4. **Core event a tiempo**: `maintenance_log_created` con `is_overdue == false`.
5. **Tardanza**: `maintenance_log_created` con `days_overdue > 0` indica un log cargado tarde.
6. **Engagement**: `wizard_completed` por usuario equivale a cantidad de vehículos activos.

## Cruce con métricas de producto

| Métrica (`docs/PRODUCT.md`) | Eventos que la alimentan |
|---|---|
| **Adquisición** — sign-ups / semana | `account_created` |
| **Activación** — % sign-ups con vehículo + tipo en 24h | funnel `account_created` → `wizard_completed` → `maintenance_type_created` |
| **Engagement** — vehículos activos por usuario | `wizard_completed` + `maintenance_type_created` |
| **Retención** — usuarios con log en 30 días | `maintenance_log_created` recurrente |
| **Core event** — mantenimiento registrado a tiempo | `maintenance_log_created` (`is_overdue == false`) |
| **Timeliness** — días entre vencimiento y registro | `maintenance_log_created` (`days_overdue`, `usage_overdue`, `computed_due_at`) |
| **North Star Metric** — % vehículos activos sin vencimiento | No se deriva de un evento puntual; requiere snapshot periódico o query a la base de datos |

## Limitaciones y próximos pasos

- La **North Star Metric** depende del estado actual de cada vehículo, que cambia con el uso y el calendario sin generar un evento nuevo. Para medirla en PostHog se puede: (a) armar un job periódico que emita un evento `fleet_health` con el porcentaje de vehículos activos sin vencimiento, o (b) conectar Neon como fuente del PostHog Data Warehouse y calcularla con HogQL.
- `maintenance_log_created` incluye `days_overdue` para logs tardíos, pero no `days_until_due` para logs hechos con anticipación. Si se necesita medir cuántos días de margen tuvo el usuario, agregar esa propiedad al evento.
- Todos los eventos incluyen `environment` (`dev` / `preview` / `prod`) para poder aislar tráfico real en producción.
