/**
 * Dev seed: fills the database with a realistic garage covering every UI
 * state (urgency levels, archived vehicles/types, paginated history, parts
 * lifecycle, edited logs).
 *
 * Usage:
 *   pnpm db:seed                # seed for the userId that already owns vehicles
 *   pnpm db:seed user_xxx       # seed for a specific Clerk user id
 *   pnpm db:seed user_xxx --fresh   # delete that user's vehicles first (cascades)
 *
 * Plain Node (type stripping): only relative imports + erasable TS here —
 * the `@/` path alias does not resolve outside Next.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { desc, eq } from "drizzle-orm";
import {
  vehicles,
  maintenanceTypes,
  maintenanceLogs,
  maintenanceLogEdits,
  parts,
  type Vehicle,
} from "../db/schema.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing — check .env.local");
  process.exit(1);
}
const db = drizzle(neon(url), { schema: { vehicles } });

const DAY = 86_400_000;
// performedAtDate is date-only stored as UTC midnight (see lib/maintenance/next-due.ts).
function daysAgo(days: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
      days * DAY,
  );
}
function monthsAgo(months: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months, now.getUTCDate()),
  );
}

async function resolveUserId(): Promise<string> {
  const arg = process.argv.find((a) => a.startsWith("user_"));
  if (arg) return arg;

  const rows = await db
    .select({ userId: vehicles.userId })
    .from(vehicles)
    .groupBy(vehicles.userId)
    .orderBy(desc(vehicles.userId))
    .limit(1);
  if (rows[0]) return rows[0].userId;

  console.error(
    "No vehicles found to infer the user id. Pass it explicitly:\n" +
      "  pnpm db:seed user_xxxxxxxx\n" +
      "(find it in the Clerk dashboard, or create one vehicle from the app first)",
  );
  process.exit(1);
}

async function main() {
  const userId = await resolveUserId();
  const fresh = process.argv.includes("--fresh");

  if (fresh) {
    const deleted = await db
      .delete(vehicles)
      .where(eq(vehicles.userId, userId))
      .returning({ id: vehicles.id });
    console.log(`--fresh: deleted ${deleted.length} vehicles (children cascade)`);
  }

  async function addVehicle(
    input: Omit<typeof vehicles.$inferInsert, "userId">,
  ): Promise<Vehicle> {
    const [v] = await db
      .insert(vehicles)
      .values({ ...input, userId })
      .returning();
    return v;
  }
  async function addType(
    vehicleId: string,
    input: Omit<typeof maintenanceTypes.$inferInsert, "vehicleId">,
  ) {
    const [t] = await db
      .insert(maintenanceTypes)
      .values({ ...input, vehicleId })
      .returning();
    return t;
  }
  async function addLog(
    vehicleId: string,
    typeId: string,
    value: number,
    date: Date,
    notes?: string,
    extra?: Partial<typeof maintenanceLogs.$inferInsert>,
  ) {
    const [l] = await db
      .insert(maintenanceLogs)
      .values({
        vehicleId,
        maintenanceTypeId: typeId,
        performedAtValue: String(value),
        performedAtDate: date,
        notes: notes ?? null,
        ...extra,
      })
      .returning();
    return l;
  }
  async function addPart(
    vehicleId: string,
    input: Omit<typeof parts.$inferInsert, "vehicleId">,
  ) {
    const [p] = await db
      .insert(parts)
      .values({ ...input, vehicleId })
      .returning();
    return p;
  }

  // ── Moto principal: every urgency state + paginated history + edits ──
  const husky = await addVehicle({
    name: "Husqvarna TE 300",
    type: "moto",
    subtype: "moto_enduro",
    metricUnit: "horas",
    currentValue: "120",
    usageRatePerWeek: "3",
  });

  const aceite = await addType(husky.id, {
    name: "Cambio de aceite",
    intervalValue: "10",
  });
  // 14 logs → history pagination (>10 shows "Cargar más").
  const aceiteLogs: [number, number][] = [
    [5, 720], [15, 660], [22, 600], [30, 540], [38, 480], [45, 420],
    [52, 360], [60, 300], [68, 240], [75, 200], [82, 160], [90, 120],
    [97, 60], [105, 25],
  ];
  let lastAceiteLog;
  for (const [value, ago] of aceiteLogs) {
    lastAceiteLog = await addLog(
      husky.id,
      aceite.id,
      value,
      daysAgo(ago),
      ago === 25 ? "Motul 300V 10w40" : undefined,
    );
  }
  // Latest log at 105h, bike at 120h, interval 10h → due 115 → VENCIDO.
  // Give the newest log an edit history → "Editado (2)".
  if (lastAceiteLog) {
    for (const [prevValue, prevDays, note] of [
      [104, 26, "valor corregido"],
      [103, 27, null],
    ] as const) {
      await db.insert(maintenanceLogEdits).values({
        maintenanceLogId: lastAceiteLog.id,
        editedBy: userId,
        previousPerformedAtValue: String(prevValue),
        previousPerformedAtDate: daysAgo(prevDays),
        previousNotes: note,
      });
    }
    await db
      .update(maintenanceLogs)
      .set({ lastEditedAt: new Date() })
      .where(eq(maintenanceLogs.id, lastAceiteLog.id));
  }

  const filtro = await addType(husky.id, {
    name: "Filtro de aire",
    intervalValue: "20",
  });
  await addLog(husky.id, filtro.id, 104, daysAgo(30));
  // due 124, remaining 4 → ratio 0.2 → PRONTO.

  const transmision = await addType(husky.id, {
    name: "Kit de transmisión",
    intervalValue: "50",
  });
  await addLog(husky.id, transmision.id, 100, daysAgo(45), "DID ERT3");
  // due 150, remaining 30 → OK.

  await addType(husky.id, {
    name: "Registro de válvulas",
    intervalValue: "40",
  });
  // No logs → SIN_REGISTRO.

  const suspension = await addType(husky.id, {
    name: "Revisión suspensión",
    intervalCalendarValue: 6,
    intervalCalendarUnit: "meses",
  });
  await addLog(husky.id, suspension.id, 95, monthsAgo(5));
  // ~1 month left of 6 → ratio <0.2 → PRONTO.

  const frenos = await addType(husky.id, {
    name: "Líquido de frenos",
    intervalCalendarValue: 12,
    intervalCalendarUnit: "meses",
  });
  await addLog(husky.id, frenos.id, 60, monthsAgo(14));
  // overdue by ~2 months → VENCIDO.

  await addType(husky.id, { name: "Lavado general" });
  // No intervals → only visible in the "Tipos de mantenimiento" management list.

  const tipoArchivado = await addType(husky.id, {
    name: "Bujía (tipo viejo)",
    intervalValue: "30",
    archivedAt: daysAgo(15),
  });
  await addLog(husky.id, tipoArchivado.id, 90, daysAgo(90), "NGK");
  await addLog(husky.id, tipoArchivado.id, 60, daysAgo(200));
  // Archived: hidden from próximos/selects, but its logs keep the name.

  await addPart(husky.id, {
    name: "Pastillas de freno delantero",
    status: "pendiente_instalar",
    maintenanceTypeId: frenos.id,
  });
  if (lastAceiteLog) {
    await addPart(husky.id, {
      name: "Filtro de aire Twin Air",
      status: "instalado",
      maintenanceLogId: lastAceiteLog.id,
      notes: "Vino sin jaula, la reutilicé",
    });
  }
  await addPart(husky.id, { name: "Manija de embrague", status: "wishlist" });

  // ── Autos ──
  const fitito = await addVehicle({
    name: "Fiat 600 'Fitito'",
    type: "auto",
    metricUnit: "km",
    currentValue: "135000",
    usageRatePerWeek: "200",
  });
  const fitAceite = await addType(fitito.id, {
    name: "Cambio de aceite",
    intervalValue: "10000",
    intervalCalendarValue: 12,
    intervalCalendarUnit: "meses",
  });
  await addLog(fitito.id, fitAceite.id, 124000, monthsAgo(8));
  // due 134000 km → VENCIDO by usage.
  const distrib = await addType(fitito.id, {
    name: "Kit de distribución",
    intervalValue: "60000",
  });
  await addLog(fitito.id, distrib.id, 90000, monthsAgo(30));
  await addPart(fitito.id, {
    name: "Kit de distribución completo",
    status: "wishlist",
    maintenanceTypeId: distrib.id,
  });

  const suran = await addVehicle({
    name: "Suran de mamá",
    type: "auto",
    metricUnit: "km",
    currentValue: "80000",
    usageRatePerWeek: "150",
  });
  const suranAceite = await addType(suran.id, {
    name: "Cambio de aceite",
    intervalValue: "10000",
  });
  await addLog(suran.id, suranAceite.id, 75000, monthsAgo(4));

  const raptor = await addVehicle({
    name: "Ford Raptor",
    type: "auto",
    metricUnit: "km",
    currentValue: "62000",
    usageRatePerWeek: "250",
  });
  const raptorAceite = await addType(raptor.id, {
    name: "Cambio de aceite",
    intervalValue: "10000",
  });
  await addLog(raptor.id, raptorAceite.id, 53000, monthsAgo(3));
  // due 63000, remaining 1000 → ratio 0.1 → PRONTO.

  // ── Moto secundaria, bici, monopatín ──
  const yamaha = await addVehicle({
    name: "Yamaha FZ 150",
    type: "moto",
    subtype: "moto_calle",
    metricUnit: "km",
    currentValue: "45000",
    usageRatePerWeek: "300",
  });
  const fzAceite = await addType(yamaha.id, {
    name: "Cambio de aceite",
    intervalValue: "3000",
  });
  await addLog(yamaha.id, fzAceite.id, 43000, monthsAgo(3));

  const bici = await addVehicle({
    name: "Specialized Allez",
    type: "bicicleta",
    subtype: "bici_ruta",
    metricUnit: "km",
    currentValue: "3400",
  });
  const cadena = await addType(bici.id, {
    name: "Cambio de cadena",
    intervalValue: "3000",
  });
  await addLog(bici.id, cadena.id, 700, monthsAgo(10));
  // due 3700, remaining 300 → PRONTO.
  await addPart(bici.id, {
    name: "Cadena Shimano 105",
    status: "instalado",
  });

  // Resto de subtypes de bici — pueblan el grupo en el dashboard.
  const enduro = await addVehicle({
    name: "Santa Cruz Nomad",
    type: "bicicleta",
    subtype: "bici_enduro",
    metricUnit: "km",
    currentValue: "800",
  });
  const enduroSusp = await addType(enduro.id, {
    name: "Service suspensión",
    intervalCalendarValue: 6,
    intervalCalendarUnit: "meses",
  });
  await addLog(enduro.id, enduroSusp.id, 400, monthsAgo(7));
  // ~1 month overdue → VENCIDO.

  const dh = await addVehicle({
    name: "Commencal Supreme DH",
    type: "bicicleta",
    subtype: "bici_downhill",
    metricUnit: "km",
    currentValue: "300",
  });
  const dhFrenos = await addType(dh.id, {
    name: "Pastillas de freno",
    intervalValue: "500",
  });
  await addLog(dh.id, dhFrenos.id, 50, monthsAgo(4));
  // due 550, remaining 250 → OK.

  const levo = await addVehicle({
    name: "Specialized Turbo Levo",
    type: "bicicleta",
    subtype: "bici_electrica",
    metricUnit: "km",
    currentValue: "1500",
  });
  const levoMotor = await addType(levo.id, {
    name: "Service motor/batería",
    intervalCalendarValue: 12,
    intervalCalendarUnit: "meses",
  });
  await addLog(levo.id, levoMotor.id, 600, monthsAgo(10));
  // ~2 months left of 12 → OK.

  const monopatin = await addVehicle({
    name: "Xiaomi Pro 2",
    type: "monopatin",
    metricUnit: "km",
    currentValue: "120",
  });
  await addType(monopatin.id, {
    name: "Revisión de frenos",
    intervalCalendarValue: 6,
    intervalCalendarUnit: "meses",
  });
  // No logs → SIN_REGISTRO.

  // ── Archived vehicle: read-only detail view ──
  const vieja = await addVehicle({
    name: "Honda XR 200 (vendida)",
    type: "moto",
    subtype: "moto_enduro",
    metricUnit: "km",
    currentValue: "32000",
    archivedAt: daysAgo(10),
  });
  const xrAceite = await addType(vieja.id, {
    name: "Cambio de aceite",
    intervalValue: "2000",
  });
  await addLog(vieja.id, xrAceite.id, 31000, daysAgo(120));
  await addLog(vieja.id, xrAceite.id, 29000, daysAgo(300));
  await addPart(vieja.id, { name: "Cubre puños", status: "instalado" });

  console.log(`Seed OK para ${userId}:`);
  console.log("  10 vehículos activos + 1 archivado");
  console.log("  Husky: 8 tipos (vencido ×2, pronto ×2, ok, sin registro, sin intervalo, archivado) + 16 logs + repuestos");
  console.log("  Probá: /dashboard (grupos, dots, archivados) → detalle Husky → Cargar más → gestión de tipos");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
