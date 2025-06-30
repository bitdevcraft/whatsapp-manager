import { timestamps } from "../helpers/column-helper";
import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  jsonb,
  pgPolicy,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { whatsAppBusinessAccountsTable } from "./whatsapp-business-accounts";

export const whatsAppBusinessAccountPhoneNumbersTable = pgTable(
  "whatsapp_business_account_phone_numbers",
  {
    id: bigint({ mode: "number" }).primaryKey().notNull(),
    displayPhoneNumber: varchar("display_phone_number", { length: 50 }),
    verifiedName: varchar("verified_name", { length: 50 }),
    status: varchar("status", { length: 50 }),
    qualityRating: varchar("quality_rating", { length: 50 }),
    searchVisibility: varchar("search_visibility", { length: 50 }),
    platformType: varchar("platform_type", { length: 50 }),
    codeVerificationStatus: varchar("code_verification_status", { length: 50 }),
    accountMode: varchar("account_mode", { length: 50 }),
    certificate: text("certificate"),
    conversationalAutomation: jsonb("conversational_automation").$type<
      Record<string, any>
    >(),
    healthStatus: jsonb("health_status").$type<{
      can_send_message: string;
      entities: {
        entity_type: string;
        id: string;
        can_send_message: string;
        additional_info?: string[];
        errors?: Array<{
          error_code: number;
          error_description: string;
          possible_solution: string;
        }>;
      }[];
    }>(),
    isOfficialBusinessAccount: boolean("is_official_business_account"),
    isOnBizApp: boolean("is_on_biz_app"),
    isPinEnabled: boolean("is_pin_enabled"),
    isPreverifiedNumber: boolean("is_preverified_number"),
    lastOnboardTime: text("last_onboard_time"),
    messagingLimitTier: varchar("messaging_limit_tier", { length: 50 }),
    nameStatus: varchar("name_status", { length: 50 }),
    newCertificate: text("new_certificate"),
    newNameStatus: varchar("new_name_status", { length: 50 }),
    qualityScore: jsonb("quality_score"),
    throughput: jsonb("throughput").$type<{ level: string }>(),
    isRegistered: boolean("is_registered"),

    //   Team ID
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
      using: sql`${t.teamId}
            = current_setting('app.current_tenant')::uuid`,
    }),
    // inserts must set team_id = current_tenant
    pgPolicy("whatsapp_business_account_phone_numbers_insert_tenant", {
      for: "insert",
      to: process.env.POSTGRES_USER_ROLE!,
      withCheck: sql`${t.teamId}
            = current_setting('app.current_tenant')::uuid`,
    }),
    // updates only on your rows, and team_id can't be changed
    pgPolicy("whatsapp_business_account_phone_numbers_update_tenant", {
      for: "update",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId}
            = current_setting('app.current_tenant')::uuid`,
      withCheck: sql`${t.teamId}
            = current_setting('app.current_tenant')::uuid`,
    }),
    // deletes only your rows
    pgPolicy("whatsapp_business_account_phone_numbers_delete_tenant", {
      for: "delete",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId}
            = current_setting('app.current_tenant')::uuid`,
    }),
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

export type WhatsAppBusinessAccountPhoneNumber =
  typeof whatsAppBusinessAccountPhoneNumbersTable.$inferSelect;
export type NewWhatsAppBusinessAccountPhoneNumber =
  typeof whatsAppBusinessAccountPhoneNumbersTable.$inferInsert;
