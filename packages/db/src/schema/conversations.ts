import { MessageStatus } from "@workspace/wa-cloud-api/core/webhook";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { enumToValues } from "../enums/enum-helper";
import { timestamps } from "../helpers/column-helper";
import { createOrganizationPolicies } from "../policies/workspace";
import { baseIdModel } from "./abstract/baseIdModel";
import { contactsTable } from "./contacts";
import { marketingCampaignsTable } from "./marketing-campaigns";
import { teamsTable } from "./teams";
import { usersTable } from "./users";
import { templatesTable } from "./templates";

export const conversationStatusEnum = pgEnum(
  "message_status",
  enumToValues(MessageStatus)
);

export interface baseConversation {
  media?: {
    caption?: string;
    id?: string;
    url?: string;
  };
  text?: string;
}

export interface ConversationBody {
  body?: baseConversation;
  buttons?: {
    text?: string;
    type: string;
  }[];
  cards?: {
    body?: baseConversation;
    buttons?: {
      text?: string;
      type: string;
    }[];
    header?: baseConversation;
  }[];
  footer?: string;
  header?: baseConversation;
  location?: {
    address?: string;
    latitude: number;
    longitude: number;
    name?: string;
  };
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
    body: jsonb("body").$type<ConversationBody>(),
    contactId: uuid("contact_id").references(() => contactsTable.id),
    content: jsonb("content"),
    direction: varchar("direction", {
      enum: ["inbound", "outbound"],
      length: 30,
    }),
    from: uuid("from"),
    isMarketingCampaign: boolean("is_marketing_campaign"),
    marketingCampaignId: uuid("marketing_campaign_id").references(
      () => marketingCampaignsTable.id
    ),
    repliedTo: text("replied_to"),
    status: conversationStatusEnum(),
    success: boolean("success"),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
    userId: uuid("user_id").references(() => usersTable.id),
    wamid: text("wamid").unique(),
    waResponse: jsonb("wa_response"),
    ...timestamps,
    conversationSearch: tsvector("conversation_search").notNull().default(""),
    templateId: varchar("template_id").references(() => templatesTable.id),
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
  ({ many, one }) => ({
    contact: one(contactsTable, {
      fields: [conversationsTable.contactId],
      references: [contactsTable.id],
    }),
    marketingCampaign: one(marketingCampaignsTable, {
      fields: [conversationsTable.marketingCampaignId],
      references: [marketingCampaignsTable.id],
    }),
    relatedConversations: many(conversationsTable),
    repliedConversation: one(conversationsTable, {
      fields: [conversationsTable.repliedTo],
      references: [conversationsTable.wamid],
    }),
    team: one(teamsTable, {
      fields: [conversationsTable.teamId],
      references: [teamsTable.id],
    }),
    template: one(templatesTable, {
      fields: [conversationsTable.templateId],
      references: [templatesTable.id],
    }),
    user: one(usersTable, {
      fields: [conversationsTable.userId],
      references: [usersTable.id],
    }),
  })
);

export type Conversation = typeof conversationsTable.$inferSelect;
export type ConversationWithContact = Conversation & {
  contact: {
    id: string;
    name: null | string;
    phone: string;
  };
};

export type NewConversation = typeof conversationsTable.$inferInsert;
