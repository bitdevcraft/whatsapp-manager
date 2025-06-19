import { relations } from "drizzle-orm";
import { baseSchema } from "../helpers/column-helper";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { TeamMember, teamMembersTable } from "./team-members";
import { activityLogsTable } from "./activity-logs";
import { invitationsTable } from "./invitations";
import { User } from "./users";
import { contactsTable } from "./contacts";
import { conversationsTable } from "./conversations";
import { eventsTable } from "./events";
import { leadsTable } from "./leads";
import { listViewsTable } from "./list-views";
import { marketingCampaignsTable } from "./marketing-campaigns";
import { outboxTable } from "./outbox";
import { tagsTable } from "./tags";
import { templatesTable } from "./templates";
import { whatsAppBusinessAccountsTable } from "./whatsapp-business-accounts";
import { whatsAppBusinessAccountPhoneNumbersTable } from "./whatsapp-business-account-phone-numbers";

export const teamsTable = pgTable("teams", {
  ...baseSchema,
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeProductId: text("stripe_product_id"),
  planName: varchar("plan_name", { length: 50 }),
  subscriptionStatus: varchar("subscription_status", { length: 20 }),
});

export type Team = typeof teamsTable.$inferSelect;
export type NewTeam = typeof teamsTable.$inferInsert;

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
    user: Pick<User, "id" | "name" | "email">;
  })[];
};
