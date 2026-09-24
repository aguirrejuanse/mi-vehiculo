import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  numeric,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "moto",
  "auto",
  "bicicleta",
  "monopatin",
]);

export const metricUnitEnum = pgEnum("metric_unit", ["horas", "km"]);

export const calendarUnitEnum = pgEnum("calendar_unit", ["dias", "meses"]);

export const partStatusEnum = pgEnum("part_status", [
  "wishlist",
  "pendiente_instalar",
  "instalado",
]);

// Subtype taxonomy is per-`type`: moto_* only applies to type "moto",
// bici_* only to type "bicicleta". "auto" and "monopatin" have no
// subtype and store null. Cross-validation lives in lib/validation/vehicle.ts
// (SUBTYPES_BY_TYPE), not in Postgres — same convention as type/metricUnit.
export const vehicleSubtypeEnum = pgEnum("vehicle_subtype", [
  "moto_calle",
  "moto_enduro",
  "bici_ruta",
  "bici_enduro",
  "bici_downhill",
  "bici_electrica",
]);

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Clerk user id (not a local foreign key — Clerk owns the users table)
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    type: vehicleTypeEnum("type").notNull(),
    // Nullable: only moto/bicicleta have a subtype taxonomy; auto/monopatin
    // store null. Immutable after creation (see vehicleUpdateSchema).
    subtype: vehicleSubtypeEnum("subtype"),
    metricUnit: metricUnitEnum("metric_unit").notNull(),
    currentValue: numeric("current_value").notNull().default("0"),
    // How much the metric advances per week on average (nullable: unknown until the user sets it)
    usageRatePerWeek: numeric("usage_rate_per_week"),
    // Soft-delete: null means active; a timestamp means archived on that date.
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("vehicles_user_id_idx").on(table.userId)],
);

export const maintenanceTypes = pgTable(
  "maintenance_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // Interval expressed in the vehicle's metric unit (e.g. every 5000 km / every 50 horas).
    // Nullable: a maintenanceType can instead (or additionally) use a calendar
    // interval below. Cross-validation (at least one of the two must be set)
    // lives in lib/validation/maintenance-type.ts, not in Postgres.
    intervalValue: numeric("interval_value"),
    // Calendar-based interval, independent from intervalValue. Both must be
    // set together or both left null — enforced in application validation.
    intervalCalendarValue: integer("interval_calendar_value"),
    intervalCalendarUnit: calendarUnitEnum("interval_calendar_unit"),
    // Soft-delete: null means active; a timestamp means archived on that
    // date. Logs/parts that reference it keep their data — archiving only
    // hides the type from selects, next-due and the management list.
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("maintenance_types_vehicle_id_idx").on(table.vehicleId)],
);

export const maintenanceLogs = pgTable(
  "maintenance_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    maintenanceTypeId: uuid("maintenance_type_id")
      .notNull()
      .references(() => maintenanceTypes.id, { onDelete: "cascade" }),
    // The vehicle's metric value (horas/km) at the moment this maintenance was performed
    performedAtValue: numeric("performed_at_value").notNull(),
    performedAtDate: timestamp("performed_at_date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    // Timestamp of the most recent edit, if any. Unlike the old `editedAt`
    // flag, this does not gate further edits — it's only a quick "last
    // edited on X" indicator without joining maintenance_log_edits.
    lastEditedAt: timestamp("last_edited_at"),
  },
  (table) => [
    index("maintenance_logs_vehicle_id_idx").on(table.vehicleId),
    index("maintenance_logs_maintenance_type_id_idx").on(table.maintenanceTypeId),
  ],
);

// Full edit history for a maintenance log. Each row is a snapshot of the
// values a log had BEFORE a given edit overwrote them, so the complete
// history can be reconstructed: the current values live on
// maintenanceLogs, and every prior version lives here.
export const maintenanceLogEdits = pgTable(
  "maintenance_log_edits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    maintenanceLogId: uuid("maintenance_log_id")
      .notNull()
      .references(() => maintenanceLogs.id, { onDelete: "cascade" }),
    // Clerk user id of whoever made the edit (not a local foreign key)
    editedBy: text("edited_by").notNull(),
    editedAt: timestamp("edited_at").notNull().defaultNow(),
    previousPerformedAtValue: numeric("previous_performed_at_value").notNull(),
    previousPerformedAtDate: timestamp("previous_performed_at_date").notNull(),
    previousNotes: text("previous_notes"),
  },
  (table) => [
    index("maintenance_log_edits_maintenance_log_id_idx").on(table.maintenanceLogId),
  ],
);

// A repuesto (part) can optionally hang forward off a maintenanceType
// ("buy this before the type's next-due hits") or backward off a
// maintenanceLog (a retroactive quality note on a part already installed),
// but NEVER both at once. Mutual exclusion is validated in
// lib/validation/part.ts, not in Postgres. vehicleId cascades (no vehicle,
// no meaning); the two optional FKs use "set null" — a part is its own
// entity and shouldn't evaporate just because the type/log it referenced
// was deleted.
export const parts = pgTable(
  "parts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: partStatusEnum("status").notNull(),
    maintenanceTypeId: uuid("maintenance_type_id").references(
      () => maintenanceTypes.id,
      { onDelete: "set null" },
    ),
    maintenanceLogId: uuid("maintenance_log_id").references(
      () => maintenanceLogs.id,
      { onDelete: "set null" },
    ),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("parts_vehicle_id_idx").on(table.vehicleId)],
);

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  maintenanceTypes: many(maintenanceTypes),
  maintenanceLogs: many(maintenanceLogs),
  parts: many(parts),
}));

export const maintenanceTypesRelations = relations(
  maintenanceTypes,
  ({ one, many }) => ({
    vehicle: one(vehicles, {
      fields: [maintenanceTypes.vehicleId],
      references: [vehicles.id],
    }),
    maintenanceLogs: many(maintenanceLogs),
    parts: many(parts),
  }),
);

export const maintenanceLogsRelations = relations(
  maintenanceLogs,
  ({ one, many }) => ({
    vehicle: one(vehicles, {
      fields: [maintenanceLogs.vehicleId],
      references: [vehicles.id],
    }),
    maintenanceType: one(maintenanceTypes, {
      fields: [maintenanceLogs.maintenanceTypeId],
      references: [maintenanceTypes.id],
    }),
    edits: many(maintenanceLogEdits),
    parts: many(parts),
  }),
);

export const partsRelations = relations(parts, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [parts.vehicleId],
    references: [vehicles.id],
  }),
  maintenanceType: one(maintenanceTypes, {
    fields: [parts.maintenanceTypeId],
    references: [maintenanceTypes.id],
  }),
  maintenanceLog: one(maintenanceLogs, {
    fields: [parts.maintenanceLogId],
    references: [maintenanceLogs.id],
  }),
}));

export const maintenanceLogEditsRelations = relations(
  maintenanceLogEdits,
  ({ one }) => ({
    maintenanceLog: one(maintenanceLogs, {
      fields: [maintenanceLogEdits.maintenanceLogId],
      references: [maintenanceLogs.id],
    }),
  }),
);

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type MaintenanceType = typeof maintenanceTypes.$inferSelect;
export type NewMaintenanceType = typeof maintenanceTypes.$inferInsert;
export type MaintenanceLog = typeof maintenanceLogs.$inferSelect;
export type NewMaintenanceLog = typeof maintenanceLogs.$inferInsert;
export type MaintenanceLogEdit = typeof maintenanceLogEdits.$inferSelect;
export type NewMaintenanceLogEdit = typeof maintenanceLogEdits.$inferInsert;
export type Part = typeof parts.$inferSelect;
export type NewPart = typeof parts.$inferInsert;
