ALTER TABLE "activity_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "list_views" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "activity_logs_select_tenant" ON "activity_logs" AS PERMISSIVE FOR SELECT TO "postgres" USING ("activity_logs"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "activity_logs_insert_tenant" ON "activity_logs" AS PERMISSIVE FOR INSERT TO "postgres" WITH CHECK ("activity_logs"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "activity_logs_update_tenant" ON "activity_logs" AS PERMISSIVE FOR UPDATE TO "postgres" USING ("activity_logs"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("activity_logs"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "activity_logs_delete_tenant" ON "activity_logs" AS PERMISSIVE FOR DELETE TO "postgres" USING ("activity_logs"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "contacts_select_tenant" ON "contacts" AS PERMISSIVE FOR SELECT TO "postgres" USING ("contacts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "contacts_insert_tenant" ON "contacts" AS PERMISSIVE FOR INSERT TO "postgres" WITH CHECK ("contacts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "contacts_update_tenant" ON "contacts" AS PERMISSIVE FOR UPDATE TO "postgres" USING ("contacts"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("contacts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "contacts_delete_tenant" ON "contacts" AS PERMISSIVE FOR DELETE TO "postgres" USING ("contacts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "conversations_select_tenant" ON "conversations" AS PERMISSIVE FOR SELECT TO "postgres" USING ("conversations"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "conversations_insert_tenant" ON "conversations" AS PERMISSIVE FOR INSERT TO "postgres" WITH CHECK ("conversations"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "conversations_update_tenant" ON "conversations" AS PERMISSIVE FOR UPDATE TO "postgres" USING ("conversations"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("conversations"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "conversations_delete_tenant" ON "conversations" AS PERMISSIVE FOR DELETE TO "postgres" USING ("conversations"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "events_select_tenant" ON "events" AS PERMISSIVE FOR SELECT TO "postgres" USING ("events"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "events_insert_tenant" ON "events" AS PERMISSIVE FOR INSERT TO "postgres" WITH CHECK ("events"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "events_update_tenant" ON "events" AS PERMISSIVE FOR UPDATE TO "postgres" USING ("events"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("events"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "events_delete_tenant" ON "events" AS PERMISSIVE FOR DELETE TO "postgres" USING ("events"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "leads_select_tenant" ON "leads" AS PERMISSIVE FOR SELECT TO "postgres" USING ("leads"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "leads_insert_tenant" ON "leads" AS PERMISSIVE FOR INSERT TO "postgres" WITH CHECK ("leads"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "leads_update_tenant" ON "leads" AS PERMISSIVE FOR UPDATE TO "postgres" USING ("leads"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("leads"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "leads_delete_tenant" ON "leads" AS PERMISSIVE FOR DELETE TO "postgres" USING ("leads"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "list_views_select_tenant" ON "list_views" AS PERMISSIVE FOR SELECT TO "postgres" USING ("list_views"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "list_views_insert_tenant" ON "list_views" AS PERMISSIVE FOR INSERT TO "postgres" WITH CHECK ("list_views"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "list_views_update_tenant" ON "list_views" AS PERMISSIVE FOR UPDATE TO "postgres" USING ("list_views"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("list_views"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "list_views_delete_tenant" ON "list_views" AS PERMISSIVE FOR DELETE TO "postgres" USING ("list_views"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "marketing_campaigns_select_tenant" ON "marketing_campaigns" AS PERMISSIVE FOR SELECT TO "postgres" USING ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "marketing_campaigns_insert_tenant" ON "marketing_campaigns" AS PERMISSIVE FOR INSERT TO "postgres" WITH CHECK ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "marketing_campaigns_update_tenant" ON "marketing_campaigns" AS PERMISSIVE FOR UPDATE TO "postgres" USING ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "marketing_campaigns_delete_tenant" ON "marketing_campaigns" AS PERMISSIVE FOR DELETE TO "postgres" USING ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "tags_select_tenant" ON "tags" AS PERMISSIVE FOR SELECT TO "postgres" USING ("tags"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "tags_insert_tenant" ON "tags" AS PERMISSIVE FOR INSERT TO "postgres" WITH CHECK ("tags"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "tags_update_tenant" ON "tags" AS PERMISSIVE FOR UPDATE TO "postgres" USING ("tags"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("tags"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "tags_delete_tenant" ON "tags" AS PERMISSIVE FOR DELETE TO "postgres" USING ("tags"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_select_tenant" ON "templates" AS PERMISSIVE FOR SELECT TO "postgres" USING ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_insert_tenant" ON "templates" AS PERMISSIVE FOR INSERT TO "postgres" WITH CHECK ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_update_tenant" ON "templates" AS PERMISSIVE FOR UPDATE TO "postgres" USING ("templates"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_delete_tenant" ON "templates" AS PERMISSIVE FOR DELETE TO "postgres" USING ("templates"."team_id" = current_setting('app.current_tenant')::uuid);