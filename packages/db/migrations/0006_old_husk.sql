CREATE TABLE "templates" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"content" jsonb,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"team_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "templates_select_tenant" ON "templates" AS PERMISSIVE FOR SELECT TO "app_user" USING ("templates"."team_id"
            = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_insert_tenant" ON "templates" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("templates"."team_id"
            = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_update_tenant" ON "templates" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("templates"."team_id"
            = current_setting('app.current_tenant')::uuid) WITH CHECK ("templates"."team_id"
            = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_delete_tenant" ON "templates" AS PERMISSIVE FOR DELETE TO "app_user" USING ("templates"."team_id"
            = current_setting('app.current_tenant')::uuid);