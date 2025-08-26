CREATE TYPE "public"."max_limit_type" AS ENUM('one-time', 'recurring');--> statement-breakpoint
ALTER TABLE "team_member_limits" ADD COLUMN "max_limit_type" "max_limit_type" DEFAULT 'recurring';--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "stripe_metadata" jsonb;