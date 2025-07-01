ALTER TABLE "conversations" ADD COLUMN "direction" varchar(30);--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;