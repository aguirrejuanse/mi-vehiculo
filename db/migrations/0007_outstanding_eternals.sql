CREATE TYPE "public"."part_status" AS ENUM('wishlist', 'pendiente_instalar', 'instalado');--> statement-breakpoint
CREATE TABLE "parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"name" text NOT NULL,
	"status" "part_status" NOT NULL,
	"maintenance_type_id" uuid,
	"maintenance_log_id" uuid,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_maintenance_type_id_maintenance_types_id_fk" FOREIGN KEY ("maintenance_type_id") REFERENCES "public"."maintenance_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_maintenance_log_id_maintenance_logs_id_fk" FOREIGN KEY ("maintenance_log_id") REFERENCES "public"."maintenance_logs"("id") ON DELETE set null ON UPDATE no action;