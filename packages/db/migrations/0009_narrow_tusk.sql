CREATE TYPE "public"."file-location" AS ENUM('aws_s3', 'local');--> statement-breakpoint
CREATE TABLE "file_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fileLocation" "file-location",
	"file_size" integer,
	"expires_in" timestamp,
	"team_id" uuid NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "max_file_storage_size" bigint;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "current_file_storage_size" bigint;--> statement-breakpoint
ALTER TABLE "file_attachment" ADD CONSTRAINT "file_attachment_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;