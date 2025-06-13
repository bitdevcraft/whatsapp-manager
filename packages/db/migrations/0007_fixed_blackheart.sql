ALTER TABLE "activity_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "activity_logs_select_tenant" ON "activity_logs" CASCADE;--> statement-breakpoint
DROP POLICY "activity_logs_insert_tenant" ON "activity_logs" CASCADE;--> statement-breakpoint
DROP POLICY "activity_logs_update_tenant" ON "activity_logs" CASCADE;--> statement-breakpoint
DROP POLICY "activity_logs_delete_tenant" ON "activity_logs" CASCADE;