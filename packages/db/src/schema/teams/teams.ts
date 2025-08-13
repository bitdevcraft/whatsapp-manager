import { relations } from "drizzle-orm";
import { bigint, pgTable, text, varchar } from "drizzle-orm/pg-core";

import { baseModel } from "../abstract/baseModel";
import { activityLogsTable } from "../activity-logs";
import { contactsTable } from "../contacts";
import { conversationsTable } from "../conversations";
import { eventsTable } from "../events";
import { invitationsTable } from "../invitations";
import { leadsTable } from "../leads";
import { listViewsTable } from "../list-views";
import { marketingCampaignsTable } from "../marketing-campaigns";
import { outboxTable } from "../outbox";
import { tagsTable } from "../tags";
import { templatesTable } from "../templates";
import { User } from "../users";
import { whatsAppBusinessAccountPhoneNumbersTable } from "../whatsapp-business-account-phone-numbers";
import { whatsAppBusinessAccountsTable } from "../whatsapp-business-accounts";
import { TeamMember, teamMembersTable } from "./team-members";

export const teamsTable = pgTable("teams", {
  ...baseModel,
  currentFileStorageSize: bigint("current_file_storage_size", {
    mode: "number",
  }).default(0),
  maxFileStorageSize: bigint("max_file_storage_size", {
    mode: "number",
  }).default(
    // 2 Gb
    2 * 1024 * 1024 * 1024
  ),
  metadata: text("metadata"),
  planName: varchar("plan_name", { length: 50 }),
  slug: text("slug"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeProductId: text("stripe_product_id"),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  subscriptionStatus: varchar("subscription_status", { length: 20 }),
});

export type NewTeam = typeof teamsTable.$inferInsert;
export type Team = typeof teamsTable.$inferSelect;

export const teamsRelations = relations(teamsTable, ({ many }) => ({
  activityLogs: many(activityLogsTable),
  contacts: many(contactsTable),
  conversations: many(conversationsTable),
  events: many(eventsTable),
  invitations: many(invitationsTable),
  leads: many(leadsTable),
  listViews: many(listViewsTable),
  marketingCampaigns: many(marketingCampaignsTable),
  outbox: many(outboxTable),
  tags: many(tagsTable),
  teamMembers: many(teamMembersTable),
  templates: many(templatesTable),
  waBusinessAccount: many(whatsAppBusinessAccountsTable),
  waBusinessPhoneNumber: many(whatsAppBusinessAccountPhoneNumbersTable),
}));

export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, "email" | "id" | "name">;
  })[];
};
