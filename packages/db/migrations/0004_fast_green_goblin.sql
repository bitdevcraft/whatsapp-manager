ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "account_mode" varchar(50);--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "certificate" text;--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "conversational_automation" jsonb;--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "health_status" jsonb;--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "is_official_business_account" boolean;--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "is_on_biz_app" boolean;--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "is_pin_enabled" boolean;--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "is_preverified_number" boolean;--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "last_onboard_time" text;--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "messaging_limit_tier" varchar(50);--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "name_status" varchar(50);--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "new_certificate" text;--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "new_name_status" varchar(50);--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "quality_score" jsonb;--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD COLUMN "throughput" jsonb;--> statement-breakpoint
ALTER POLICY "whatsapp_business_account_phone_numbers_select_tenant" ON "whatsapp_business_account_phone_numbers" TO app_user USING ("whatsapp_business_account_phone_numbers"."team_id"
            = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "whatsapp_business_account_phone_numbers_insert_tenant" ON "whatsapp_business_account_phone_numbers" TO app_user WITH CHECK ("whatsapp_business_account_phone_numbers"."team_id"
            = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "whatsapp_business_account_phone_numbers_update_tenant" ON "whatsapp_business_account_phone_numbers" TO app_user USING ("whatsapp_business_account_phone_numbers"."team_id"
            = current_setting('app.current_tenant')::uuid) WITH CHECK ("whatsapp_business_account_phone_numbers"."team_id"
            = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
ALTER POLICY "whatsapp_business_account_phone_numbers_delete_tenant" ON "whatsapp_business_account_phone_numbers" TO app_user USING ("whatsapp_business_account_phone_numbers"."team_id"
            = current_setting('app.current_tenant')::uuid);