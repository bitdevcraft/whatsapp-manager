


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."entity" AS ENUM (
    'Contact',
    'Conversation',
    'Event',
    'Lead',
    'Outbox',
    'User'
);


ALTER TYPE "public"."entity" OWNER TO "postgres";


CREATE TYPE "public"."file-location" AS ENUM (
    'aws_s3',
    'local'
);


ALTER TYPE "public"."file-location" OWNER TO "postgres";


CREATE TYPE "public"."limit_type" AS ENUM (
    'inherited',
    'custom'
);


ALTER TYPE "public"."limit_type" OWNER TO "postgres";


CREATE TYPE "public"."message_status" AS ENUM (
    'delivered',
    'read',
    'sent'
);


ALTER TYPE "public"."message_status" OWNER TO "postgres";


CREATE TYPE "public"."status" AS ENUM (
    'disabled',
    'draft',
    'failed',
    'pending',
    'processing',
    'success'
);


ALTER TYPE "public"."status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."contacts_normalize_phone_tg"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- strip all non-digits; keep empty string if NULL
  NEW.phone := regexp_replace(coalesce(NEW.phone, ''), '\D', '', 'g');

  -- If you want to skip work on updates where phone didn't change:
  IF TG_OP = 'UPDATE' AND NEW.phone IS NOT DISTINCT FROM OLD.phone THEN
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."contacts_normalize_phone_tg"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."conversation_tsv_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Extract JSONB fields
  NEW.conversation_search :=
    to_tsvector('english',
      coalesce(NEW.body::text,'')
    )
    -- Append author name via a subquery
    || to_tsvector('english',
      coalesce(
        (SELECT name || ' ' || phone FROM contacts WHERE id = NEW.contact_id),
        ''
      )
    );
  RETURN NEW;
END
$$;


ALTER FUNCTION "public"."conversation_tsv_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_upsert_conversation_members"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -------------------------------------------------------------------
  -- Ignore rows that are not tied to a contact (e.g. system events)
  -------------------------------------------------------------------
  IF NEW.contact_id IS NULL THEN
    RETURN NEW;
  END IF;

  -------------------------------------------------------------------
  -- Insert one row per team-member; skip duplicates gracefully
  -------------------------------------------------------------------
  INSERT INTO public.conversation_members  (team_id,
                                            contact_id,
                                            user_id,
                                            last_read_at)
  SELECT NEW.team_id,
         NEW.contact_id,
         tm.user_id,
         '1970-01-01'                       -- default value; tweak freely
  FROM   public.team_members AS tm
  WHERE  tm.organization_id = NEW.team_id
  ON CONFLICT (user_id, contact_id) DO NOTHING;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_upsert_conversation_members"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "timestamp" timestamp without time zone DEFAULT "now"() NOT NULL,
    "ip_address" character varying(45)
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "phone" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "interests" "jsonb" DEFAULT '[]'::"jsonb",
    "message" character varying(2048) NOT NULL,
    "opt_in" boolean DEFAULT true,
    "assigned_to" "uuid",
    "tags" "jsonb" DEFAULT '[]'::"jsonb",
    "team_id" "uuid" NOT NULL,
    "normalized_phone" character varying(255) GENERATED ALWAYS AS ("regexp_replace"(("phone")::"text", '\D'::"text", ''::"text", 'g'::"text")) STORED,
    "last_message_date" timestamp without time zone
);


ALTER TABLE "public"."contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_members" (
    "team_id" "uuid",
    "contact_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "last_read_at" timestamp without time zone DEFAULT '1970-01-01 00:00:00'::timestamp without time zone
);


ALTER TABLE "public"."conversation_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "jsonb",
    "from" "uuid",
    "contact_id" "uuid",
    "is_marketing_campaign" boolean,
    "wa_response" "jsonb",
    "wamid" "text",
    "status" "public"."message_status",
    "team_id" "uuid" NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "marketing_campaign_id" "uuid",
    "success" boolean,
    "body" "jsonb",
    "replied_to" "text",
    "direction" character varying(30),
    "user_id" "uuid",
    "conversation_search" "tsvector" DEFAULT ''::"tsvector" NOT NULL
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "aggregate_type" character varying(100) NOT NULL,
    "aggregate_id" "uuid" NOT NULL,
    "event_type" character varying(100) NOT NULL,
    "payload" "jsonb" NOT NULL,
    "version" integer NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "team_id" "uuid" NOT NULL
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."file_attachment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fileLocation" "public"."file-location",
    "file_size" integer,
    "expires_in" timestamp without time zone,
    "team_id" "uuid" NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone
);


ALTER TABLE "public"."file_attachment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "role" character varying(50) NOT NULL,
    "invited_by" "uuid" NOT NULL,
    "invited_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL
);


ALTER TABLE "public"."invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "updated_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "phone" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "interests" "jsonb" DEFAULT '[]'::"jsonb",
    "message" character varying(2048) NOT NULL,
    "opt_in" boolean DEFAULT true,
    "assignedTo" "uuid",
    "team_id" "uuid" NOT NULL
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."list_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "updated_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "entity" "public"."entity",
    "team_id" "uuid" NOT NULL
);


ALTER TABLE "public"."list_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."marketing_campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "updated_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "description" character varying(65535),
    "template_id" character varying NOT NULL,
    "schedule_at" timestamp without time zone,
    "processed_at" timestamp without time zone,
    "completed_at" timestamp without time zone,
    "status" "public"."status",
    "enable_tracking" boolean DEFAULT false,
    "phone_number" character varying(15),
    "created_by" "uuid",
    "payload" "jsonb",
    "tags" "jsonb",
    "recipients" "jsonb",
    "analytics" "jsonb",
    "team_id" "uuid" NOT NULL,
    "message_template" "jsonb",
    "total_recipients" integer
);


ALTER TABLE "public"."marketing_campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."outbox" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "processed_at" timestamp without time zone,
    "team_id" "uuid" NOT NULL
);


ALTER TABLE "public"."outbox" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "updated_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "name" character varying(255) NOT NULL,
    "normalized_name" character varying(255) GENERATED ALWAYS AS ("lower"("replace"("regexp_replace"(TRIM(BOTH FROM "name"), '\s+'::"text", ' '::"text", 'g'::"text"), ' '::"text", '-'::"text"))) STORED,
    "team_id" "uuid" NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "updated_at" timestamp without time zone,
    "organization_id" "uuid" NOT NULL,
    "email" character varying(255),
    "expires_at" timestamp without time zone,
    "inviter_id" "uuid",
    "role" character varying(255),
    "status" character varying(255)
);


ALTER TABLE "public"."team_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_member_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "limitType" "public"."limit_type" DEFAULT 'inherited'::"public"."limit_type",
    "max_limit" integer,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_member_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "role" character varying(50) NOT NULL,
    "joined_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "updated_at" timestamp without time zone,
    "whatsapp_limit" integer DEFAULT 1000
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members_usage_tracking" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "period_end" timestamp without time zone,
    "period_start" timestamp without time zone,
    "team_id" "uuid" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "usage_count" integer DEFAULT 0,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."team_members_usage_tracking" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "updated_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "stripe_product_id" "text",
    "plan_name" character varying(50),
    "subscription_status" character varying(20),
    "max_file_storage_size" bigint DEFAULT '2147483648'::bigint,
    "current_file_storage_size" bigint DEFAULT 0,
    "slug" "text",
    "metadata" "text",
    "whatsapp_limit" integer DEFAULT 1000
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."templates" (
    "id" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "content" "jsonb",
    "updated_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "team_id" "uuid" NOT NULL
);


ALTER TABLE "public"."templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "updated_at" timestamp without time zone,
    "access_token" "text",
    "access_token_expires_at" timestamp without time zone,
    "account_id" "text" NOT NULL,
    "id_token" "text",
    "password" "text",
    "provider_id" "text",
    "refresh_token" "text",
    "refresh_token_expires_at" timestamp without time zone,
    "scope" "text",
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "updated_at" timestamp without time zone,
    "action" "text" NOT NULL,
    "ip_address" character varying(45),
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "updated_at" timestamp without time zone,
    "active_organization_id" "uuid",
    "expires_at" timestamp with time zone NOT NULL,
    "ip_address" character varying(100),
    "token" "text",
    "user_agent" character varying(255),
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "updated_at" timestamp without time zone,
    "expires_at" timestamp without time zone,
    "identifier" "text",
    "value" "text"
);


ALTER TABLE "public"."user_verifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255),
    "updated_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "role" character varying(255) DEFAULT 'user'::character varying NOT NULL,
    "email" character varying(255) NOT NULL,
    "password_hash" "text",
    "email_verified" boolean,
    "image" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."whatsapp_business_account_phone_numbers" (
    "id" bigint NOT NULL,
    "display_phone_number" character varying(50),
    "verified_name" character varying(50),
    "status" character varying(50),
    "quality_rating" character varying(50),
    "search_visibility" character varying(50),
    "platform_type" character varying(50),
    "code_verification_status" character varying(50),
    "team_id" "uuid" NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "account_mode" character varying(50),
    "certificate" "text",
    "conversational_automation" "jsonb",
    "health_status" "jsonb",
    "is_official_business_account" boolean,
    "is_on_biz_app" boolean,
    "is_pin_enabled" boolean,
    "is_preverified_number" boolean,
    "last_onboard_time" "text",
    "messaging_limit_tier" character varying(50),
    "name_status" character varying(50),
    "new_certificate" "text",
    "new_name_status" character varying(50),
    "quality_score" "jsonb",
    "throughput" "jsonb",
    "is_registered" boolean
);


ALTER TABLE "public"."whatsapp_business_account_phone_numbers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."whatsapp_business_accounts" (
    "id" bigint NOT NULL,
    "name" character varying(255),
    "currency" character varying(255),
    "owner_business_id" character varying(255),
    "owner_business_name" character varying(255),
    "business_id" character varying(255),
    "phone_number_id" character varying(255),
    "waba_id" character varying(255),
    "auth_response" "jsonb",
    "auth_token" "jsonb",
    "team_id" "uuid" NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "ad_account_id" character varying(255)
);


ALTER TABLE "public"."whatsapp_business_accounts" OWNER TO "postgres";


ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_user_id_contact_id_pk" PRIMARY KEY ("user_id", "contact_id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_wamid_unique" UNIQUE ("wamid");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."file_attachment"
    ADD CONSTRAINT "file_attachment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."list_views"
    ADD CONSTRAINT "list_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketing_campaigns"
    ADD CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."outbox"
    ADD CONSTRAINT "outbox_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_per_team" UNIQUE ("team_id", "name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_member_limits"
    ADD CONSTRAINT "team_member_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members_usage_tracking"
    ADD CONSTRAINT "team_members_usage_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_stripe_customer_id_unique" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_stripe_subscription_id_unique" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_accounts"
    ADD CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_activity_logs"
    ADD CONSTRAINT "user_activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_verifications"
    ADD CONSTRAINT "user_verifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_business_account_phone_numbers"
    ADD CONSTRAINT "whatsapp_business_account_phone_numbers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_business_accounts"
    ADD CONSTRAINT "whatsapp_business_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_business_accounts"
    ADD CONSTRAINT "whatsapp_business_accounts_waba_id_unique" UNIQUE ("waba_id");



CREATE INDEX "cm_conv_idx" ON "public"."conversation_members" USING "btree" ("contact_id");



CREATE INDEX "cm_user_idx" ON "public"."conversation_members" USING "btree" ("user_id");



CREATE UNIQUE INDEX "contacts_team_phone_unique" ON "public"."contacts" USING "btree" ("team_id", "phone");



CREATE INDEX "idx_conversation_search" ON "public"."conversations" USING "gin" ("conversation_search");



CREATE INDEX "idx_conversations_body_trgm" ON "public"."conversations" USING "gin" ((("body")::"text") "public"."gin_trgm_ops");



CREATE UNIQUE INDEX "team_member_limits_unique" ON "public"."team_member_limits" USING "btree" ("team_id", "user_id");



CREATE UNIQUE INDEX "team_members_usage_tracking_unique" ON "public"."team_members_usage_tracking" USING "btree" ("team_id", "period_end", "period_start", "user_id");



CREATE OR REPLACE TRIGGER "contacts_normalize_phone_biu" BEFORE INSERT OR UPDATE OF "phone" ON "public"."contacts" FOR EACH ROW EXECUTE FUNCTION "public"."contacts_normalize_phone_tg"();



CREATE OR REPLACE TRIGGER "trg_upsert_conversation_members" AFTER INSERT ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."fn_upsert_conversation_members"();



CREATE OR REPLACE TRIGGER "tsvectorupdate" BEFORE INSERT OR UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."conversation_tsv_trigger"();



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id");



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_marketing_campaign_id_marketing_campaigns_id_fk" FOREIGN KEY ("marketing_campaign_id") REFERENCES "public"."marketing_campaigns"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."file_attachment"
    ADD CONSTRAINT "file_attachment_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_assignedTo_users_id_fk" FOREIGN KEY ("assignedTo") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."list_views"
    ADD CONSTRAINT "list_views_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."marketing_campaigns"
    ADD CONSTRAINT "marketing_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."marketing_campaigns"
    ADD CONSTRAINT "marketing_campaigns_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."outbox"
    ADD CONSTRAINT "outbox_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id");



ALTER TABLE ONLY "public"."outbox"
    ADD CONSTRAINT "outbox_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_organization_id_teams_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."team_member_limits"
    ADD CONSTRAINT "team_member_limits_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."team_member_limits"
    ADD CONSTRAINT "team_member_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_organization_id_teams_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."team_members_usage_tracking"
    ADD CONSTRAINT "team_members_usage_tracking_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."team_members_usage_tracking"
    ADD CONSTRAINT "team_members_usage_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."user_accounts"
    ADD CONSTRAINT "user_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_activity_logs"
    ADD CONSTRAINT "user_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_active_organization_id_teams_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."whatsapp_business_account_phone_numbers"
    ADD CONSTRAINT "whatsapp_business_account_phone_numbers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."whatsapp_business_accounts"
    ADD CONSTRAINT "whatsapp_business_accounts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "contacts_delete_tenant" ON "public"."contacts" FOR DELETE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "contacts_insert_tenant" ON "public"."contacts" FOR INSERT TO "app_user" WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "contacts_select_tenant" ON "public"."contacts" FOR SELECT TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "contacts_update_tenant" ON "public"."contacts" FOR UPDATE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid")) WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversations_delete_tenant" ON "public"."conversations" FOR DELETE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "conversations_insert_tenant" ON "public"."conversations" FOR INSERT TO "app_user" WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "conversations_select_tenant" ON "public"."conversations" FOR SELECT TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "conversations_update_tenant" ON "public"."conversations" FOR UPDATE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid")) WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "events_delete_tenant" ON "public"."events" FOR DELETE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "events_insert_tenant" ON "public"."events" FOR INSERT TO "app_user" WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "events_select_tenant" ON "public"."events" FOR SELECT TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "events_update_tenant" ON "public"."events" FOR UPDATE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid")) WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "leads_delete_tenant" ON "public"."leads" FOR DELETE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "leads_insert_tenant" ON "public"."leads" FOR INSERT TO "app_user" WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "leads_select_tenant" ON "public"."leads" FOR SELECT TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "leads_update_tenant" ON "public"."leads" FOR UPDATE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid")) WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



ALTER TABLE "public"."list_views" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "list_views_delete_tenant" ON "public"."list_views" FOR DELETE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "list_views_insert_tenant" ON "public"."list_views" FOR INSERT TO "app_user" WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "list_views_select_tenant" ON "public"."list_views" FOR SELECT TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "list_views_update_tenant" ON "public"."list_views" FOR UPDATE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid")) WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



ALTER TABLE "public"."marketing_campaigns" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "marketing_campaigns_delete_tenant" ON "public"."marketing_campaigns" FOR DELETE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "marketing_campaigns_insert_tenant" ON "public"."marketing_campaigns" FOR INSERT TO "app_user" WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "marketing_campaigns_select_tenant" ON "public"."marketing_campaigns" FOR SELECT TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "marketing_campaigns_update_tenant" ON "public"."marketing_campaigns" FOR UPDATE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid")) WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tags_delete_tenant" ON "public"."tags" FOR DELETE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "tags_insert_tenant" ON "public"."tags" FOR INSERT TO "app_user" WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "tags_select_tenant" ON "public"."tags" FOR SELECT TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "tags_update_tenant" ON "public"."tags" FOR UPDATE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid")) WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



ALTER TABLE "public"."team_member_limits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "team_member_limits_delete_tenant" ON "public"."team_member_limits" FOR DELETE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "team_member_limits_insert_tenant" ON "public"."team_member_limits" FOR INSERT TO "app_user" WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "team_member_limits_select_tenant" ON "public"."team_member_limits" FOR SELECT TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "team_member_limits_update_tenant" ON "public"."team_member_limits" FOR UPDATE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid")) WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



ALTER TABLE "public"."team_members_usage_tracking" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "team_members_usage_tracking_delete_tenant" ON "public"."team_members_usage_tracking" FOR DELETE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "team_members_usage_tracking_insert_tenant" ON "public"."team_members_usage_tracking" FOR INSERT TO "app_user" WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "team_members_usage_tracking_select_tenant" ON "public"."team_members_usage_tracking" FOR SELECT TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "team_members_usage_tracking_update_tenant" ON "public"."team_members_usage_tracking" FOR UPDATE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid")) WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



ALTER TABLE "public"."templates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "templates_delete_tenant" ON "public"."templates" FOR DELETE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "templates_insert_tenant" ON "public"."templates" FOR INSERT TO "app_user" WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "templates_select_tenant" ON "public"."templates" FOR SELECT TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "templates_update_tenant" ON "public"."templates" FOR UPDATE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid")) WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



ALTER TABLE "public"."whatsapp_business_account_phone_numbers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "whatsapp_business_account_phone_numbers_delete_tenant" ON "public"."whatsapp_business_account_phone_numbers" FOR DELETE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "whatsapp_business_account_phone_numbers_insert_tenant" ON "public"."whatsapp_business_account_phone_numbers" FOR INSERT TO "app_user" WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "whatsapp_business_account_phone_numbers_select_tenant" ON "public"."whatsapp_business_account_phone_numbers" FOR SELECT TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "whatsapp_business_account_phone_numbers_update_tenant" ON "public"."whatsapp_business_account_phone_numbers" FOR UPDATE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid")) WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



ALTER TABLE "public"."whatsapp_business_accounts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "whatsapp_business_accounts_delete_tenant" ON "public"."whatsapp_business_accounts" FOR DELETE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "whatsapp_business_accounts_insert_tenant" ON "public"."whatsapp_business_accounts" FOR INSERT TO "app_user" WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "whatsapp_business_accounts_select_tenant" ON "public"."whatsapp_business_accounts" FOR SELECT TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));



CREATE POLICY "whatsapp_business_accounts_update_tenant" ON "public"."whatsapp_business_accounts" FOR UPDATE TO "app_user" USING (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid")) WITH CHECK (("team_id" = ("current_setting"('app.current_tenant'::"text"))::"uuid"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "app_user";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."contacts_normalize_phone_tg"() TO "anon";
GRANT ALL ON FUNCTION "public"."contacts_normalize_phone_tg"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."contacts_normalize_phone_tg"() TO "service_role";



GRANT ALL ON FUNCTION "public"."conversation_tsv_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."conversation_tsv_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."conversation_tsv_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."daitch_mokotoff"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."daitch_mokotoff"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."daitch_mokotoff"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."daitch_mokotoff"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."difference"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."difference"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."difference"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."difference"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."dmetaphone"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."dmetaphone"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."dmetaphone"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."dmetaphone"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."dmetaphone_alt"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."dmetaphone_alt"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."dmetaphone_alt"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."dmetaphone_alt"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_upsert_conversation_members"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_upsert_conversation_members"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_upsert_conversation_members"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."levenshtein"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."levenshtein"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."levenshtein"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."levenshtein"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."levenshtein"("text", "text", integer, integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."levenshtein"("text", "text", integer, integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."levenshtein"("text", "text", integer, integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."levenshtein"("text", "text", integer, integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."levenshtein_less_equal"("text", "text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."levenshtein_less_equal"("text", "text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."levenshtein_less_equal"("text", "text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."levenshtein_less_equal"("text", "text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."levenshtein_less_equal"("text", "text", integer, integer, integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."levenshtein_less_equal"("text", "text", integer, integer, integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."levenshtein_less_equal"("text", "text", integer, integer, integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."levenshtein_less_equal"("text", "text", integer, integer, integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."metaphone"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."metaphone"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."metaphone"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."metaphone"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."soundex"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."soundex"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."soundex"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."soundex"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."text_soundex"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."text_soundex"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."text_soundex"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."text_soundex"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."activity_logs" TO "app_user";



GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."contacts" TO "app_user";



GRANT ALL ON TABLE "public"."conversation_members" TO "anon";
GRANT ALL ON TABLE "public"."conversation_members" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_members" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."conversation_members" TO "app_user";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."conversations" TO "app_user";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."events" TO "app_user";



GRANT ALL ON TABLE "public"."file_attachment" TO "anon";
GRANT ALL ON TABLE "public"."file_attachment" TO "authenticated";
GRANT ALL ON TABLE "public"."file_attachment" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."file_attachment" TO "app_user";



GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."invitations" TO "app_user";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."leads" TO "app_user";



GRANT ALL ON TABLE "public"."list_views" TO "anon";
GRANT ALL ON TABLE "public"."list_views" TO "authenticated";
GRANT ALL ON TABLE "public"."list_views" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."list_views" TO "app_user";



GRANT ALL ON TABLE "public"."marketing_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."marketing_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."marketing_campaigns" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."marketing_campaigns" TO "app_user";



GRANT ALL ON TABLE "public"."outbox" TO "anon";
GRANT ALL ON TABLE "public"."outbox" TO "authenticated";
GRANT ALL ON TABLE "public"."outbox" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."outbox" TO "app_user";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."tags" TO "app_user";



GRANT ALL ON TABLE "public"."team_invitations" TO "anon";
GRANT ALL ON TABLE "public"."team_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."team_invitations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."team_invitations" TO "app_user";



GRANT ALL ON TABLE "public"."team_member_limits" TO "anon";
GRANT ALL ON TABLE "public"."team_member_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."team_member_limits" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."team_member_limits" TO "app_user";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."team_members" TO "app_user";



GRANT ALL ON TABLE "public"."team_members_usage_tracking" TO "anon";
GRANT ALL ON TABLE "public"."team_members_usage_tracking" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members_usage_tracking" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."team_members_usage_tracking" TO "app_user";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."teams" TO "app_user";



GRANT ALL ON TABLE "public"."templates" TO "anon";
GRANT ALL ON TABLE "public"."templates" TO "authenticated";
GRANT ALL ON TABLE "public"."templates" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."templates" TO "app_user";



GRANT ALL ON TABLE "public"."user_accounts" TO "anon";
GRANT ALL ON TABLE "public"."user_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."user_accounts" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."user_accounts" TO "app_user";



GRANT ALL ON TABLE "public"."user_activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."user_activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activity_logs" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."user_activity_logs" TO "app_user";



GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."user_sessions" TO "app_user";



GRANT ALL ON TABLE "public"."user_verifications" TO "anon";
GRANT ALL ON TABLE "public"."user_verifications" TO "authenticated";
GRANT ALL ON TABLE "public"."user_verifications" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."user_verifications" TO "app_user";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."users" TO "app_user";



GRANT ALL ON TABLE "public"."whatsapp_business_account_phone_numbers" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_business_account_phone_numbers" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_business_account_phone_numbers" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."whatsapp_business_account_phone_numbers" TO "app_user";



GRANT ALL ON TABLE "public"."whatsapp_business_accounts" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_business_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_business_accounts" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."whatsapp_business_accounts" TO "app_user";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,USAGE ON SEQUENCES TO "app_user";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO "app_user";































