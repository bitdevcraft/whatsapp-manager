import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { usersTable } from "./users";
import { sql } from "drizzle-orm";
import { contactsTable } from "./contacts";

export const conversationMembersTable = pgTable(
  "conversation_members",
  {
    teamId: uuid("team_id").references(() => teamsTable.id),
    contactId: uuid("contact_id").references(() => contactsTable.id),
    userId: uuid("user_id").references(() => usersTable.id),
    lastReadAt: timestamp("last_read_at", { mode: "date" }).default(
      sql`'1970-01-01'`
    ),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.contactId] }),
    index("cm_user_idx").on(t.userId),
    index("cm_conv_idx").on(t.contactId),
  ]
);
