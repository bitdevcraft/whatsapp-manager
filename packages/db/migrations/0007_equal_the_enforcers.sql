CREATE TABLE "campaign_error_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"marketing_campaign_id" uuid,
	"team_id" uuid NOT NULL,
	"recipient_phone" varchar(20),
	"error_type" varchar(100),
	"error_message" varchar(65535),
	"error_stack" text,
	"job_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaign_message_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"marketing_campaign_id" uuid,
	"team_id" uuid NOT NULL,
	"recipient_phone" varchar(20) NOT NULL,
	"wamid" varchar(100),
	"status" varchar(50) NOT NULL,
	"error_code" varchar(100),
	"error_message" varchar(65535),
	"retry_count" integer DEFAULT 0,
	"can_retry" boolean DEFAULT true,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD COLUMN "sent_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD COLUMN "delivered_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD COLUMN "failed_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD COLUMN "error_summary" jsonb;--> statement-breakpoint
ALTER TABLE "campaign_error_logs" ADD CONSTRAINT "campaign_error_logs_marketing_campaign_id_marketing_campaigns_id_fk" FOREIGN KEY ("marketing_campaign_id") REFERENCES "public"."marketing_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_message_status" ADD CONSTRAINT "campaign_message_status_marketing_campaign_id_marketing_campaigns_id_fk" FOREIGN KEY ("marketing_campaign_id") REFERENCES "public"."marketing_campaigns"("id") ON DELETE cascade ON UPDATE no action;