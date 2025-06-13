import { timestamps } from "../helpers/column-helper";
import { sql } from "drizzle-orm";
import { bigint, pgPolicy, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";

export const whatsAppBusinessAccountPhoneNumbersTable = pgTable(
  "whatsapp_business_account_phone_numbers",
  {
    id: bigint({ mode: "number" }).primaryKey().notNull(),
    displayPhoneNumber: varchar("display_phone_number", { length: 15 }),
    verifiedName: varchar("verified_name", { length: 50 }),
    status: varchar("status", { length: 50 }),
    qualityRating: varchar("quality_rating", { length: 50 }),
    searchVisibility: varchar("search_visibility", { length: 50 }),
    platformType: varchar("platform_type", { length: 50 }),
    codeVerificationStatus: varchar("code_verification_status", { length: 50 }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
    ...timestamps,
  },
  (t) => [
    // only allow SELECTs where team_id matches the session var
    pgPolicy("whatsapp_business_account_phone_numbers_select_tenant", {
      for: "select",
      to: process.env.POSTGRES_USER_ROLE!, // <-- your DB role here
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // inserts must set team_id = current_tenant
    pgPolicy("whatsapp_business_account_phone_numbers_insert_tenant", {
      for: "insert",
      to: process.env.POSTGRES_USER_ROLE!,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // updates only on your rows, and team_id can't be changed
    pgPolicy("whatsapp_business_account_phone_numbers_update_tenant", {
      for: "update",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // deletes only your rows
    pgPolicy("whatsapp_business_account_phone_numbers_delete_tenant", {
      for: "delete",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
  ]
);
