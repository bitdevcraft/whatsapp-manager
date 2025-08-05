ALTER TABLE "team_invitations" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "team_invitations" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "team_invitations" ADD COLUMN "inviter_id" uuid;--> statement-breakpoint
ALTER TABLE "team_invitations" ADD COLUMN "role" varchar(255);--> statement-breakpoint
ALTER TABLE "team_invitations" ADD COLUMN "status" varchar(255);--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;