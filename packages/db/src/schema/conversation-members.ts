import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { contactsTable } from "./contacts";
import { teamsTable } from "./teams";
import { usersTable } from "./users";

export const conversationMembersTable = pgTable(
  "conversation_members",
  {
    contactId: uuid("contact_id").references(() => contactsTable.id),
    lastReadAt: timestamp("last_read_at", { mode: "date" }).default(
      sql`'1970-01-01'`
    ),
    teamId: uuid("team_id").references(() => teamsTable.id),
    userId: uuid("user_id").references(() => usersTable.id),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.contactId] }),
    index("cm_user_idx").on(t.userId),
    index("cm_conv_idx").on(t.contactId),
  ]
);
