ALTER TABLE "vehicles" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
CREATE INDEX "maintenance_log_edits_maintenance_log_id_idx" ON "maintenance_log_edits" USING btree ("maintenance_log_id");--> statement-breakpoint
CREATE INDEX "maintenance_logs_vehicle_id_idx" ON "maintenance_logs" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "maintenance_logs_maintenance_type_id_idx" ON "maintenance_logs" USING btree ("maintenance_type_id");--> statement-breakpoint
CREATE INDEX "maintenance_types_vehicle_id_idx" ON "maintenance_types" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "parts_vehicle_id_idx" ON "parts" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "vehicles_user_id_idx" ON "vehicles" USING btree ("user_id");