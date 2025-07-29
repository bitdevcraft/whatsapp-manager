import { timestamps } from "../helpers/column-helper";
import {
  boolean,
  customType,
  index,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { contactsTable } from "./contacts";
import { relations, SQL, sql } from "drizzle-orm";
import { enumToValues } from "../enums/enum-helper";
import { teamsTable } from "./teams";
import { MessageStatus } from "@workspace/wa-cloud-api/core/webhook";
import { marketingCampaignsTable } from "./marketing-campaigns";
import { usersTable } from "./users";
import { baseIdModel } from "./abstract/baseIdModel";
import { createOrganizationPolicies } from "../policies/workspace";

export const conversationStatusEnum = pgEnum(
  "message_status",
  enumToValues(MessageStatus)
);

export interface baseConversation {
  text?: string;
  media?: {
    url?: string;
    id?: string;
    caption?: string;
  };
}

export interface ConversationBody {
  header?: baseConversation;
  body?: baseConversation;
  footer?: string;
  location?: {
    longitude: number;
    latitude: number;
    name?: string;
    address?: string;
  };
  buttons?: {
    type: string;
    text?: string;
  }[];
}

export const tsvector = customType<{
  data: string;
}>({
  dataType() {
    return `tsvector`;
  },
});

export const conversationsTable = pgTable(
  "conversations",
  {
    ...baseIdModel,
    content: jsonb("content"),
    from: uuid("from"),
    contactId: uuid("contact_id").references(() => contactsTable.id),
    isMarketingCampaign: boolean("is_marketing_campaign"),
    marketingCampaignId: uuid("marketing_campaign_id").references(
      () => marketingCampaignsTable.id
    ),
    success: boolean("success"),
    waResponse: jsonb("wa_response"),
    wamid: text("wamid").unique(),
    repliedTo: text("replied_to"),
    status: conversationStatusEnum(),
    body: jsonb("body").$type<ConversationBody>(),
    direction: varchar("direction", {
      length: 30,
      enum: ["inbound", "outbound"],
    }),
    userId: uuid("user_id").references(() => usersTable.id),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
    ...timestamps,
    conversationSearch: tsvector("conversation_search").notNull().default(""),
  },
  (t) => [
    ...createOrganizationPolicies("conversations", t),
    index("idx_conversation_search").using("gin", t.conversationSearch),
    index("idx_conversations_body_trgm").using(
      "gin",
      sql`(${t.body}::text) gin_trgm_ops`
    ),
  ]
);

export const conversationsRelations = relations(
  conversationsTable,
  ({ one, many }) => ({
    contact: one(contactsTable, {
      fields: [conversationsTable.contactId],
      references: [contactsTable.id],
    }),
    marketingCampaign: one(marketingCampaignsTable, {
      fields: [conversationsTable.marketingCampaignId],
      references: [marketingCampaignsTable.id],
    }),
    team: one(teamsTable, {
      fields: [conversationsTable.teamId],
      references: [teamsTable.id],
    }),
    user: one(usersTable, {
      fields: [conversationsTable.userId],
      references: [usersTable.id],
    }),
    repliedConversation: one(conversationsTable, {
      fields: [conversationsTable.repliedTo],
      references: [conversationsTable.wamid],
    }),
    relatedConversations: many(conversationsTable),
  })
);

export type Conversation = typeof conversationsTable.$inferSelect;
export type NewConversation = typeof conversationsTable.$inferInsert;

export type ConversationWithContact = Conversation & {
  contact: {
    id: string;
    name: string | null;
    phone: string;
  };
};
