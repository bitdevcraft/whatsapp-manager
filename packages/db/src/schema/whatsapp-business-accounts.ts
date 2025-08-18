import { relations } from "drizzle-orm";
import { bigint, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/column-helper";
import { createOrganizationPolicies } from "../policies/workspace";
import { Team, teamsTable } from "./teams";
import { WhatsAppBusinessAccountPhoneNumber } from "./whatsapp-business-account-phone-numbers";

export interface WhatsAppBusinessAccountAccessToken {
  data: string;
  iv: string;
  tokenType?: null | string;
}

export interface WhatsAppBusinessAuthAccountResponse {
  data: string;
  expiresIn?: Date | null;
  iv: string;
  userId?: null | string;
}

export const whatsAppBusinessAccountsTable = pgTable(
  "whatsapp_business_accounts",
  {
    accessToken:
      jsonb("auth_token").$type<WhatsAppBusinessAccountAccessToken>(),
    adAccountId: varchar("ad_account_id", { length: 255 }),
    authResponse:
      jsonb("auth_response").$type<WhatsAppBusinessAuthAccountResponse>(),
    businessId: varchar("business_id", { length: 255 }),
    currency: varchar("currency", { length: 255 }),
    id: bigint({ mode: "number" }).primaryKey().notNull(),
    name: varchar("name", { length: 255 }),
    ownerBusinessId: varchar("owner_business_id", { length: 255 }),
    ownerBusinessName: varchar("owner_business_name", { length: 255 }),
    phoneNumberId: varchar("phone_number_id", { length: 255 }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
    wabaId: varchar("waba_id", { length: 255 }).unique(),
    ...timestamps,
  },
  (t) => [...createOrganizationPolicies("whatsapp_business_accounts", t)]
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

export type NewWhatsAppBusinessAccount =
  typeof whatsAppBusinessAccountsTable.$inferInsert;
export type WhatsAppBusinessAccount =
  typeof whatsAppBusinessAccountsTable.$inferSelect;

export type WhatsAppBusinessAccountDetails = WhatsAppBusinessAccount & {
  team: Team & {
    waBusinessPhoneNumber: WhatsAppBusinessAccountPhoneNumber;
  };
};
