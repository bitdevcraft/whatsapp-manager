CREATE TYPE "public"."message_status" AS ENUM('delivered', 'read', 'sent');--> statement-breakpoint
CREATE TYPE "public"."file-location" AS ENUM('aws_s3', 'local');--> statement-breakpoint
CREATE TYPE "public"."entity" AS ENUM('Contact', 'Conversation', 'Event', 'Lead', 'Outbox', 'User');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('disabled', 'draft', 'failed', 'pending', 'processing', 'success');--> statement-breakpoint
CREATE TYPE "public"."limit_type" AS ENUM('inherited', 'custom');--> statement-breakpoint
CREATE TYPE "public"."max_limit_type" AS ENUM('one-time', 'recurring');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"ip_address" varchar(45),
	"team_id" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	"assigned_to" uuid,
	"email" varchar(255) NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb,
	"last_message_date" timestamp,
	"message" varchar(2048) NOT NULL,
	"normalized_phone" varchar(255) GENERATED ALWAYS AS (regexp_replace("contacts"."phone", '\D', '', 'g')) STORED,
	"opt_in" boolean DEFAULT true,
	"phone" varchar(255) NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"team_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "conversation_members" (
	"contact_id" uuid,
	"last_read_at" timestamp DEFAULT '1970-01-01',
	"team_id" uuid,
	"user_id" uuid,
	CONSTRAINT "conversation_members_user_id_contact_id_pk" PRIMARY KEY("user_id","contact_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	"body" jsonb,
	"contact_id" uuid,
	"content" jsonb,
	"conversation_search" "tsvector" DEFAULT '' NOT NULL,
	"direction" varchar(30),
	"from" uuid,
	"is_marketing_campaign" boolean,
	"marketing_campaign_id" uuid,
	"messageTemplate" jsonb,
	"replied_to" text,
	"status" "message_status",
	"success" boolean,
	"team_id" uuid NOT NULL,
	"template_id" varchar,
	"user_id" uuid,
	"wamid" text,
	"wa_response" jsonb,
	CONSTRAINT "conversations_wamid_unique" UNIQUE("wamid")
);
--> statement-breakpoint
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"team_id" uuid NOT NULL,
	"version" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "file_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_in" timestamp,
	"fileLocation" "file-location",
	"file_size" integer,
	"team_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"invited_by" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"team_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	"assignedTo" uuid,
	"email" varchar(255) NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb,
	"message" varchar(2048) NOT NULL,
	"opt_in" boolean DEFAULT true,
	"phone" varchar(255) NOT NULL,
	"team_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "list_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	"entity" "entity",
	"team_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "list_views" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	"analytics" jsonb,
	"completed_at" timestamp,
	"created_by" uuid,
	"description" varchar(65535),
	"enable_tracking" boolean DEFAULT false,
	"message_template" jsonb,
	"payload" jsonb,
	"phone_number" varchar(15),
	"processed_at" timestamp,
	"recipients" jsonb,
	"schedule_at" timestamp,
	"status" "status",
	"tags" jsonb,
	"team_id" uuid NOT NULL,
	"template_id" varchar NOT NULL,
	"total_recipients" integer
);
--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"processed_at" timestamp,
	"team_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL,
	"normalized_name" varchar(255) GENERATED ALWAYS AS (
      lower(                                      
        replace(                                  
          regexp_replace(                         
            trim("tags"."name"),              
            '\s+', ' ', 'g'
          ),
          ' ', '-'
        )
      )
    ) STORED,
	"team_id" uuid NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "tags_per_team" UNIQUE("team_id","name")
);
--> statement-breakpoint
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "team_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	"email" varchar(255),
	"expires_at" timestamp,
	"inviter_id" uuid,
	"organization_id" uuid NOT NULL,
	"role" varchar(255),
	"status" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "team_member_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"limitType" "limit_type" DEFAULT 'inherited',
	"max_limit" integer,
	"max_limit_type" "max_limit_type" DEFAULT 'recurring',
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
	"usage_count" integer DEFAULT 0 NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_members_usage_tracking" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"user_id" uuid NOT NULL,
	"whatsapp_limit" integer DEFAULT 1000
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	"current_file_storage_size" bigint DEFAULT 0,
	"max_file_storage_size" bigint DEFAULT 2147483648,
	"metadata" text,
	"plan_name" varchar(50) DEFAULT 'demo',
	"slug" text,
	"stripe_customer_id" text,
	"stripe_metadata" jsonb,
	"stripe_product_id" text,
	"stripe_subscription_id" text,
	"subscription_status" varchar(20),
	"whatsapp_limit" integer DEFAULT 20,
	"whatsapp_subscribe_at" timestamp,
	CONSTRAINT "teams_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "teams_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"content" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"team_id" uuid NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	"access_token" text,
	"access_token_expires_at" timestamp,
	"account_id" text NOT NULL,
	"id_token" text,
	"password" text,
	"provider_id" text,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	"action" text NOT NULL,
	"ip_address" varchar(45),
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	"active_organization_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" varchar(100),
	"token" text,
	"user_agent" varchar(255),
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	"expires_at" timestamp,
	"identifier" text,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean,
	"image" text,
	"password_hash" text,
	"role" varchar(255) DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "whatsapp_business_account_phone_numbers" (
	"account_mode" varchar(50),
	"certificate" text,
	"code_verification_status" varchar(50),
	"conversational_automation" jsonb,
	"display_phone_number" varchar(50),
	"health_status" jsonb,
	"id" bigint PRIMARY KEY NOT NULL,
	"is_official_business_account" boolean,
	"is_on_biz_app" boolean,
	"is_pin_enabled" boolean,
	"is_preverified_number" boolean,
	"is_registered" boolean,
	"last_onboard_time" text,
	"messaging_limit_tier" varchar(50),
	"name_status" varchar(50),
	"new_certificate" text,
	"new_name_status" varchar(50),
	"platform_type" varchar(50),
	"quality_rating" varchar(50),
	"quality_score" jsonb,
	"search_visibility" varchar(50),
	"status" varchar(50),
	"team_id" uuid NOT NULL,
	"throughput" jsonb,
	"verified_name" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "whatsapp_business_accounts" (
	"auth_token" jsonb,
	"ad_account_id" varchar(255),
	"auth_response" jsonb,
	"business_id" varchar(255),
	"currency" varchar(255),
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"owner_business_id" varchar(255),
	"owner_business_name" varchar(255),
	"phone_number_id" varchar(255),
	"team_id" uuid NOT NULL,
	"waba_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "whatsapp_business_accounts_waba_id_unique" UNIQUE("waba_id")
);
--> statement-breakpoint
ALTER TABLE "whatsapp_business_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_marketing_campaign_id_marketing_campaigns_id_fk" FOREIGN KEY ("marketing_campaign_id") REFERENCES "public"."marketing_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_attachment" ADD CONSTRAINT "file_attachment_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedTo_users_id_fk" FOREIGN KEY ("assignedTo") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_views" ADD CONSTRAINT "list_views_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_organization_id_teams_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member_limits" ADD CONSTRAINT "team_member_limits_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member_limits" ADD CONSTRAINT "team_member_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members_usage_tracking" ADD CONSTRAINT "team_members_usage_tracking_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members_usage_tracking" ADD CONSTRAINT "team_members_usage_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_organization_id_teams_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_active_organization_id_teams_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_business_account_phone_numbers" ADD CONSTRAINT "whatsapp_business_account_phone_numbers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_business_accounts" ADD CONSTRAINT "whatsapp_business_accounts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_team_phone_unique" ON "contacts" USING btree ("team_id","phone");--> statement-breakpoint
CREATE INDEX "cm_user_idx" ON "conversation_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cm_conv_idx" ON "conversation_members" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_search" ON "conversations" USING gin ("conversation_search");--> statement-breakpoint
CREATE INDEX "idx_conversations_body_trgm" ON "conversations" USING gin (("body"::text) gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "team_member_limits_unique" ON "team_member_limits" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_usage_tracking_unique" ON "team_members_usage_tracking" USING btree ("team_id","period_end","period_start","user_id");--> statement-breakpoint
CREATE POLICY "contacts_select_tenant" ON "contacts" AS PERMISSIVE FOR SELECT TO "app_user" USING ("contacts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "contacts_insert_tenant" ON "contacts" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("contacts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "contacts_update_tenant" ON "contacts" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("contacts"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("contacts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "contacts_delete_tenant" ON "contacts" AS PERMISSIVE FOR DELETE TO "app_user" USING ("contacts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "conversations_select_tenant" ON "conversations" AS PERMISSIVE FOR SELECT TO "app_user" USING ("conversations"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "conversations_insert_tenant" ON "conversations" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("conversations"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "conversations_update_tenant" ON "conversations" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("conversations"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("conversations"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "conversations_delete_tenant" ON "conversations" AS PERMISSIVE FOR DELETE TO "app_user" USING ("conversations"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "events_select_tenant" ON "events" AS PERMISSIVE FOR SELECT TO "app_user" USING ("events"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "events_insert_tenant" ON "events" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("events"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "events_update_tenant" ON "events" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("events"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("events"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "events_delete_tenant" ON "events" AS PERMISSIVE FOR DELETE TO "app_user" USING ("events"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "leads_select_tenant" ON "leads" AS PERMISSIVE FOR SELECT TO "app_user" USING ("leads"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "leads_insert_tenant" ON "leads" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("leads"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "leads_update_tenant" ON "leads" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("leads"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("leads"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "leads_delete_tenant" ON "leads" AS PERMISSIVE FOR DELETE TO "app_user" USING ("leads"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "list_views_select_tenant" ON "list_views" AS PERMISSIVE FOR SELECT TO "app_user" USING ("list_views"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "list_views_insert_tenant" ON "list_views" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("list_views"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "list_views_update_tenant" ON "list_views" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("list_views"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("list_views"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "list_views_delete_tenant" ON "list_views" AS PERMISSIVE FOR DELETE TO "app_user" USING ("list_views"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "marketing_campaigns_select_tenant" ON "marketing_campaigns" AS PERMISSIVE FOR SELECT TO "app_user" USING ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "marketing_campaigns_insert_tenant" ON "marketing_campaigns" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "marketing_campaigns_update_tenant" ON "marketing_campaigns" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "marketing_campaigns_delete_tenant" ON "marketing_campaigns" AS PERMISSIVE FOR DELETE TO "app_user" USING ("marketing_campaigns"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "tags_select_tenant" ON "tags" AS PERMISSIVE FOR SELECT TO "app_user" USING ("tags"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "tags_insert_tenant" ON "tags" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("tags"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "tags_update_tenant" ON "tags" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("tags"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("tags"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "tags_delete_tenant" ON "tags" AS PERMISSIVE FOR DELETE TO "app_user" USING ("tags"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_member_limits_select_tenant" ON "team_member_limits" AS PERMISSIVE FOR SELECT TO "app_user" USING ("team_member_limits"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_member_limits_insert_tenant" ON "team_member_limits" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("team_member_limits"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_member_limits_update_tenant" ON "team_member_limits" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("team_member_limits"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("team_member_limits"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_member_limits_delete_tenant" ON "team_member_limits" AS PERMISSIVE FOR DELETE TO "app_user" USING ("team_member_limits"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_members_usage_tracking_select_tenant" ON "team_members_usage_tracking" AS PERMISSIVE FOR SELECT TO "app_user" USING ("team_members_usage_tracking"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_members_usage_tracking_insert_tenant" ON "team_members_usage_tracking" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("team_members_usage_tracking"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_members_usage_tracking_update_tenant" ON "team_members_usage_tracking" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("team_members_usage_tracking"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("team_members_usage_tracking"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "team_members_usage_tracking_delete_tenant" ON "team_members_usage_tracking" AS PERMISSIVE FOR DELETE TO "app_user" USING ("team_members_usage_tracking"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_select_tenant" ON "templates" AS PERMISSIVE FOR SELECT TO "app_user" USING ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_insert_tenant" ON "templates" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_update_tenant" ON "templates" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("templates"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_delete_tenant" ON "templates" AS PERMISSIVE FOR DELETE TO "app_user" USING ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_account_phone_numbers_select_tenant" ON "whatsapp_business_account_phone_numbers" AS PERMISSIVE FOR SELECT TO "app_user" USING ("whatsapp_business_account_phone_numbers"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_account_phone_numbers_insert_tenant" ON "whatsapp_business_account_phone_numbers" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("whatsapp_business_account_phone_numbers"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_account_phone_numbers_update_tenant" ON "whatsapp_business_account_phone_numbers" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("whatsapp_business_account_phone_numbers"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("whatsapp_business_account_phone_numbers"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_account_phone_numbers_delete_tenant" ON "whatsapp_business_account_phone_numbers" AS PERMISSIVE FOR DELETE TO "app_user" USING ("whatsapp_business_account_phone_numbers"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_accounts_select_tenant" ON "whatsapp_business_accounts" AS PERMISSIVE FOR SELECT TO "app_user" USING ("whatsapp_business_accounts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_accounts_insert_tenant" ON "whatsapp_business_accounts" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("whatsapp_business_accounts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_accounts_update_tenant" ON "whatsapp_business_accounts" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("whatsapp_business_accounts"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("whatsapp_business_accounts"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "whatsapp_business_accounts_delete_tenant" ON "whatsapp_business_accounts" AS PERMISSIVE FOR DELETE TO "app_user" USING ("whatsapp_business_accounts"."team_id" = current_setting('app.current_tenant')::uuid);