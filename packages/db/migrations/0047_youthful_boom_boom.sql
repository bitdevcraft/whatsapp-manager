ALTER TABLE "team_members_usage_tracking" ALTER COLUMN "usage_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "plan_name" SET DEFAULT 'demo';