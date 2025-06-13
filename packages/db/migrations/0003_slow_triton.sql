ALTER POLICY "activity_logs_select_tenant" ON "activity_logs" TO app_user USING ("activity_logs"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "activity_logs_insert_tenant" ON "activity_logs" TO app_user WITH CHECK ("activity_logs"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "activity_logs_update_tenant" ON "activity_logs" TO app_user USING ("activity_logs"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("activity_logs"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "activity_logs_delete_tenant" ON "activity_logs" TO app_user USING ("activity_logs"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "contacts_select_tenant" ON "contacts" TO app_user USING ("contacts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "contacts_insert_tenant" ON "contacts" TO app_user WITH CHECK ("contacts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "contacts_update_tenant" ON "contacts" TO app_user USING ("contacts"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("contacts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "contacts_delete_tenant" ON "contacts" TO app_user USING ("contacts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "conversations_select_tenant" ON "conversations" TO app_user USING ("conversations"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "conversations_insert_tenant" ON "conversations" TO app_user WITH CHECK ("conversations"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "conversations_update_tenant" ON "conversations" TO app_user USING ("conversations"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("conversations"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "conversations_delete_tenant" ON "conversations" TO app_user USING ("conversations"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "events_select_tenant" ON "events" TO app_user USING ("events"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "events_insert_tenant" ON "events" TO app_user WITH CHECK ("events"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "events_update_tenant" ON "events" TO app_user USING ("events"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("events"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "events_delete_tenant" ON "events" TO app_user USING ("events"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "leads_select_tenant" ON "leads" TO app_user USING ("leads"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "leads_insert_tenant" ON "leads" TO app_user WITH CHECK ("leads"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "leads_update_tenant" ON "leads" TO app_user USING ("leads"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("leads"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "leads_delete_tenant" ON "leads" TO app_user USING ("leads"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "list_views_select_tenant" ON "list_views" TO app_user USING ("list_views"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "list_views_insert_tenant" ON "list_views" TO app_user WITH CHECK ("list_views"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "list_views_update_tenant" ON "list_views" TO app_user USING ("list_views"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("list_views"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "list_views_delete_tenant" ON "list_views" TO app_user USING ("list_views"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "marketing_campaigns_select_tenant" ON "marketing_campaigns" TO app_user USING ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "marketing_campaigns_insert_tenant" ON "marketing_campaigns" TO app_user WITH CHECK ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "marketing_campaigns_update_tenant" ON "marketing_campaigns" TO app_user USING ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "marketing_campaigns_delete_tenant" ON "marketing_campaigns" TO app_user USING ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "tags_select_tenant" ON "tags" TO app_user USING ("tags"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "tags_insert_tenant" ON "tags" TO app_user WITH CHECK ("tags"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "tags_update_tenant" ON "tags" TO app_user USING ("tags"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("tags"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "tags_delete_tenant" ON "tags" TO app_user USING ("tags"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "templates_select_tenant" ON "templates" TO app_user USING ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "templates_insert_tenant" ON "templates" TO app_user WITH CHECK ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "templates_update_tenant" ON "templates" TO app_user USING ("templates"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "templates_delete_tenant" ON "templates" TO app_user USING ("templates"."team_id" = current_setting('app.current_tenant')::uuid);