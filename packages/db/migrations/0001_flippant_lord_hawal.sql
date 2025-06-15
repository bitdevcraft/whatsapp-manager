CREATE TABLE "whatsapp_business_account_phone_numbers" (
	"id" bigint PRIMARY KEY NOT NULL,
	"display_phone_number" varchar(15),
	"verified_name" varchar(50),
	"status" varchar(50),
	"quality_rating" varchar(50),
	"search_visibility" varchar(50),
	"platform_type" varchar(50),
	"code_verification_status" varchar(50),
	"team_id" uuid NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "whatsapp_business_accounts" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"currency" varchar(255),
	"owner_business_id" varchar(255),
	"owner_business_name" varchar(255),
	"business_id" varchar(255),
	"phone_number_id" varchar(255),
	"waba_id" varchar(255),
	"auth_response" jsonb,
	"auth_token" jsonb,
	"team_id" uuid NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "whatsapp_business_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD CONSTRAINT "whatsapp_business_account_phone_numbers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_business_accounts" ADD CONSTRAINT "whatsapp_business_accounts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "whatsapp_business_account_phone_numbers_select_tenant" ON "whatsapp_business_account_phone_numbers" AS PERMISSIVE FOR SELECT TO "app_user" USING ("whatsapp_business_account_phone_numbers"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_account_phone_numbers_insert_tenant" ON "whatsapp_business_account_phone_numbers" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("whatsapp_business_account_phone_numbers"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_account_phone_numbers_update_tenant" ON "whatsapp_business_account_phone_numbers" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("whatsapp_business_account_phone_numbers"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("whatsapp_business_account_phone_numbers"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_account_phone_numbers_delete_tenant" ON "whatsapp_business_account_phone_numbers" AS PERMISSIVE FOR DELETE TO "app_user" USING ("whatsapp_business_account_phone_numbers"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_accounts_select_tenant" ON "whatsapp_business_accounts" AS PERMISSIVE FOR SELECT TO "app_user" USING ("whatsapp_business_accounts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_accounts_insert_tenant" ON "whatsapp_business_accounts" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("whatsapp_business_accounts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_accounts_update_tenant" ON "whatsapp_business_accounts" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("whatsapp_business_accounts"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("whatsapp_business_accounts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_accounts_delete_tenant" ON "whatsapp_business_accounts" AS PERMISSIVE FOR DELETE TO "app_user" USING ("whatsapp_business_accounts"."team_id" = current_setting('app.current_tenant')::uuid);