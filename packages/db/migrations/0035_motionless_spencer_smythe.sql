ALTER TABLE "team_members" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "team_invitations" DROP COLUMN "name";