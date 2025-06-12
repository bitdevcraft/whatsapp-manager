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
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ALTER COLUMN "phone_number" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "is_marketing_campaign" boolean;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "wa_response" jsonb;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "wamid" varchar(65535);--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "status" "status";--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD COLUMN "processed_at" timestamp;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD COLUMN "analytics" jsonb;