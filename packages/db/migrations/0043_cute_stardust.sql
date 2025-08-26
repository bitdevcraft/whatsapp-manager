CREATE TYPE "public"."limit_type" AS ENUM('inherited', 'custom');--> statement-breakpoint
CREATE TABLE "team_member_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"limitType" "limit_type" DEFAULT 'inherited',
	"max_limit" integer,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "team_member_limits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "team_members_usage_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_end" timestamp,
	"period_start" timestamp,
	"team_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	"usage_count" integer DEFAULT 0,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_members_usage_tracking" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "whatsapp_limit" integer DEFAULT 1000;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "whatsapp_limit" integer DEFAULT 1000;--> statement-breakpoint
ALTER TABLE "team_member_limits" ADD CONSTRAINT "team_member_limits_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member_limits" ADD CONSTRAINT "team_member_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members_usage_tracking" ADD CONSTRAINT "team_members_usage_tracking_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members_usage_tracking" ADD CONSTRAINT "team_members_usage_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "team_member_limits_unique" ON "team_member_limits" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_usage_tracking_unique" ON "team_members_usage_tracking" USING btree ("team_id","period_end","period_start","user_id");--> statement-breakpoint
CREATE POLICY "team_member_limits_select_tenant" ON "team_member_limits" AS PERMISSIVE FOR SELECT TO "app_user" USING ("team_member_limits"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_member_limits_insert_tenant" ON "team_member_limits" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("team_member_limits"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_member_limits_update_tenant" ON "team_member_limits" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("team_member_limits"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("team_member_limits"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_member_limits_delete_tenant" ON "team_member_limits" AS PERMISSIVE FOR DELETE TO "app_user" USING ("team_member_limits"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_members_usage_tracking_select_tenant" ON "team_members_usage_tracking" AS PERMISSIVE FOR SELECT TO "app_user" USING ("team_members_usage_tracking"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_members_usage_tracking_insert_tenant" ON "team_members_usage_tracking" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("team_members_usage_tracking"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_members_usage_tracking_update_tenant" ON "team_members_usage_tracking" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("team_members_usage_tracking"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("team_members_usage_tracking"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_members_usage_tracking_delete_tenant" ON "team_members_usage_tracking" AS PERMISSIVE FOR DELETE TO "app_user" USING ("team_members_usage_tracking"."team_id" = current_setting('app.current_tenant')::uuid);