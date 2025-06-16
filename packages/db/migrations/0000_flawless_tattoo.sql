CREATE TYPE "public"."status" AS ENUM('pending', 'processing', 'success', 'failed', 'disabled', 'draft');--> statement-breakpoint
CREATE TYPE "public"."entity" AS ENUM('Contact', 'Conversation', 'Event', 'Lead', 'Outbox', 'User');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"phone" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb,
	"message" varchar(2048) NOT NULL,
	"opt_in" boolean DEFAULT true,
	"assigned_to" uuid,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"team_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" jsonb,
	"from" uuid,
	"contact_id" uuid,
	"is_marketing_campaign" boolean,
	"wa_response" jsonb,
	"wamid" varchar(65535),
	"status" "status",
	"team_id" uuid NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"version" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"team_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"invited_by" uuid NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"phone" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb,
	"message" varchar(2048) NOT NULL,
	"opt_in" boolean DEFAULT true,
	"assignedTo" uuid,
	"team_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "list_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"entity" "entity",
	"team_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "list_views" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"description" varchar(65535),
	"template_id" varchar NOT NULL,
	"schedule_at" timestamp,
	"processed_at" timestamp,
	"completed_at" timestamp,
	"status" "status",
	"enable_tracking" boolean DEFAULT false,
	"phone_number" varchar(15),
	"created_by" uuid,
	"payload" jsonb,
	"tags" jsonb,
	"recipients" jsonb,
	"analytics" jsonb,
	"team_id" uuid NOT NULL
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
	"updated_at" timestamp,
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
	CONSTRAINT "tags_per_team" UNIQUE("team_id","name")
);
--> statement-breakpoint
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_product_id" text,
	"plan_name" varchar(50),
	"subscription_status" varchar(20),
	CONSTRAINT "teams_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "teams_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
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
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"role" varchar(255) DEFAULT 'user' NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedTo_users_id_fk" FOREIGN KEY ("assignedTo") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_views" ADD CONSTRAINT "list_views_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
CREATE POLICY "templates_select_tenant" ON "templates" AS PERMISSIVE FOR SELECT TO "app_user" USING ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_insert_tenant" ON "templates" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_update_tenant" ON "templates" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("templates"."team_id" = current_setting('app.current_tenant')::uuid) WITH CHECK ("templates"."team_id" = current_setting('app.current_tenant')::uuid);--> statement-breakpoint
CREATE POLICY "templates_delete_tenant" ON "templates" AS PERMISSIVE FOR DELETE TO "app_user" USING ("templates"."team_id" = current_setting('app.current_tenant')::uuid);