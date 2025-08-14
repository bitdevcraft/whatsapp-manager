/* eslint-disable @typescript-eslint/no-explicit-any */
import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/column-helper";
import { createOrganizationPolicies } from "../policies/workspace";
import { teamsTable } from "./teams";

export const whatsAppBusinessAccountPhoneNumbersTable = pgTable(
  "whatsapp_business_account_phone_numbers",
  {
    accountMode: varchar("account_mode", { length: 50 }),
    certificate: text("certificate"),
    codeVerificationStatus: varchar("code_verification_status", { length: 50 }),
    conversationalAutomation: jsonb("conversational_automation").$type<
      Record<string, any>
    >(),
    displayPhoneNumber: varchar("display_phone_number", { length: 50 }),
    healthStatus: jsonb("health_status").$type<{
      can_send_message: string;
      entities: {
        additional_info?: string[];
        can_send_message: string;
        entity_type: string;
        errors?: {
          error_code: number;
          error_description: string;
          possible_solution: string;
        }[];
        id: string;
      }[];
    }>(),
    id: bigint({ mode: "number" }).primaryKey().notNull(),
    isOfficialBusinessAccount: boolean("is_official_business_account"),
    isOnBizApp: boolean("is_on_biz_app"),
    isPinEnabled: boolean("is_pin_enabled"),
    isPreverifiedNumber: boolean("is_preverified_number"),
    isRegistered: boolean("is_registered"),
    lastOnboardTime: text("last_onboard_time"),
    messagingLimitTier: varchar("messaging_limit_tier", { length: 50 }),
    nameStatus: varchar("name_status", { length: 50 }),
    newCertificate: text("new_certificate"),
    newNameStatus: varchar("new_name_status", { length: 50 }),
    platformType: varchar("platform_type", { length: 50 }),
    qualityRating: varchar("quality_rating", { length: 50 }),
    qualityScore: jsonb("quality_score"),
    searchVisibility: varchar("search_visibility", { length: 50 }),
    status: varchar("status", { length: 50 }),
    //   Team ID
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
    throughput: jsonb("throughput").$type<{ level: string }>(),

    verifiedName: varchar("verified_name", { length: 50 }),
    ...timestamps,
  },
  (t) => [
    ...createOrganizationPolicies("whatsapp_business_account_phone_numbers", t),
  ]
);

export const whatsAppBusinessAccountPhoneNumberRelations = relations(
  whatsAppBusinessAccountPhoneNumbersTable,
  ({ one }) => ({
    team: one(teamsTable, {
      fields: [whatsAppBusinessAccountPhoneNumbersTable.teamId],
      references: [teamsTable.id],
    }),
  })
);

export type NewWhatsAppBusinessAccountPhoneNumber =
  typeof whatsAppBusinessAccountPhoneNumbersTable.$inferInsert;
export type WhatsAppBusinessAccountPhoneNumber =
  typeof whatsAppBusinessAccountPhoneNumbersTable.$inferSelect;
