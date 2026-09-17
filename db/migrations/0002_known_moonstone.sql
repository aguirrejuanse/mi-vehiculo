CREATE TABLE "maintenance_log_edits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"maintenance_log_id" uuid NOT NULL,
	"edited_at" timestamp DEFAULT now() NOT NULL,
	"previous_performed_at_value" numeric NOT NULL,
	"previous_performed_at_date" timestamp NOT NULL,
	"previous_notes" text
);
--> statement-breakpoint
ALTER TABLE "maintenance_logs" ADD COLUMN "last_edited_at" timestamp;--> statement-breakpoint
ALTER TABLE "maintenance_log_edits" ADD CONSTRAINT "maintenance_log_edits_maintenance_log_id_maintenance_logs_id_fk" FOREIGN KEY ("maintenance_log_id") REFERENCES "public"."maintenance_logs"("id") ON DELETE cascade ON UPDATE no action;