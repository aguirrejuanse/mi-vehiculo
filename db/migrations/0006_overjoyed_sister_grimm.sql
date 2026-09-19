CREATE TYPE "public"."calendar_unit" AS ENUM('dias', 'meses');--> statement-breakpoint
ALTER TABLE "maintenance_types" ALTER COLUMN "interval_value" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "maintenance_types" ADD COLUMN "interval_calendar_value" integer;--> statement-breakpoint
ALTER TABLE "maintenance_types" ADD COLUMN "interval_calendar_unit" "calendar_unit";