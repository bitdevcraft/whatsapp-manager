import {
  bigint,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  serial,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { relations, sql } from "drizzle-orm";
import { timestamps } from "../helpers/column-helper";

export interface WhatsAppBusinessAuthAccountResponse {
  data: string;
  iv: string;
  expiresIn?: Date | null;
  userId?: string | null;
}

export interface WhatsAppBusinessAccountAccessToken {
  data: string;
  iv: string;
  tokenType?: string | null;
}

export const whatsAppBusinessAccountsTable = pgTable(
  "whatsapp_business_accounts",
  {
    id: bigint({ mode: "number" }).primaryKey().notNull(),
    name: varchar("name", { length: 255 }),
    currency: varchar("currency", { length: 255 }),
    ownerBusinessId: varchar("owner_business_id", { length: 255 }),
    ownerBusinessName: varchar("owner_business_name", { length: 255 }),
    businessId: varchar("business_id", { length: 255 }),
    phoneNumberId: varchar("phone_number_id", { length: 255 }),
    wabaId: varchar("waba_id", { length: 255 }),
    authResponse:
      jsonb("auth_response").$type<WhatsAppBusinessAuthAccountResponse>(),
    accessToken:
      jsonb("auth_token").$type<WhatsAppBusinessAccountAccessToken>(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
    ...timestamps,
  },
  (t) => [
    // only allow SELECTs where team_id matches the session var
    pgPolicy("whatsapp_business_accounts_select_tenant", {
      for: "select",
      to: process.env.POSTGRES_USER_ROLE!, // <-- your DB role here
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // inserts must set team_id = current_tenant
    pgPolicy("whatsapp_business_accounts_insert_tenant", {
      for: "insert",
      to: process.env.POSTGRES_USER_ROLE!,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // updates only on your rows, and team_id can't be changed
    pgPolicy("whatsapp_business_accounts_update_tenant", {
      for: "update",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // deletes only your rows
    pgPolicy("whatsapp_business_accounts_delete_tenant", {
      for: "delete",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
  ]
);

export const whatsappBusinessesRelation = relations(
  whatsAppBusinessAccountsTable,
  ({ one }) => ({
    team: one(teamsTable, {
      fields: [whatsAppBusinessAccountsTable.teamId],
      references: [teamsTable.id],
    }),
  })
);

export type WhatsAppBusiness =
  typeof whatsAppBusinessAccountsTable.$inferSelect;
export type NewWhatsAppBusiness =
  typeof whatsAppBusinessAccountsTable.$inferInsert;
