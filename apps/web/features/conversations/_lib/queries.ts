/* eslint-disable perfectionist/sort-objects */
import { contactsTable, conversationMembersTable } from "@workspace/db";
import { conversationsTable } from "@workspace/db/schema/conversations";
import { withTenantTransaction } from "@workspace/db/tenant";
import { and, count, eq, gt, ilike, isNull, or, sql } from "drizzle-orm";

import { getUserWithTeam } from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import { unstable_cache } from "@/lib/unstable-cache";

import { ConversationContact } from "./types";
import { GetConversationSchema } from "./validations";

export async function getContactConversation(contact: string) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return [];
  }

  const { teamId, user } = userWithTeam;

  return await unstable_cache(
    async () => {
      try {
        const data = await withTenantTransaction(teamId, async (tx) => {
          const data = await tx.query.conversationsTable.findMany({
            where: and(
              eq(conversationsTable.contactId, contact),
              isNull(conversationsTable.deletedAt)
            ),
            orderBy: (conversationsTable, { asc }) => [
              asc(conversationsTable.createdAt),
            ],
            with: {
              user: true,
            },
          });

          await tx
            .update(conversationMembersTable)
            .set({ lastReadAt: new Date() })
            .where(
              and(
                eq(conversationMembersTable.contactId, contact),
                eq(conversationMembersTable.userId, user.id)
              )
            );

          return data;
        });

        return data;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return [];
      }
    },
    [JSON.stringify(contact), teamId],
    {
      revalidate: 10,
      tags: [
        "conversations",
        `conversations:${teamId}:${contact}`,
        `conversations:${teamId}`,
      ],
    }
  )();
}

export async function getConversations(
  input: GetConversationSchema
): Promise<{ data: ConversationContact[]; pageCount: number }> {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return { data: [], pageCount: 0 };
  }

  const { teamId, user } = userWithTeam;
  return await unstable_cache(
    async () => {
      try {
        if (!teamId) {
          return { data: [], pageCount: 0 };
        }
        const offset = (input.page - 1) * input.perPage;

        const { data, total } = await withTenantTransaction(
          teamId,
          async (tx) => {
            const messages = tx
              .select({
                contact: {
                  name: contactsTable.name,
                  phone: contactsTable.phone,
                },
                createdAt: conversationsTable.createdAt,
                deletedAt: contactsTable.deletedAt,
                id: contactsTable.id,
                isUnread: sql<boolean>`
                      (${conversationsTable.createdAt} > ${conversationMembersTable.lastReadAt})
                    `.as("isUnread"),
                message: conversationsTable.body,
                rn: sql<number>`row_number() over (
                      partition by ${conversationsTable.contactId}
                      order by ${conversationsTable.createdAt} desc
                    )`.as("rn"),
              })
              .from(conversationsTable)
              .innerJoin(
                conversationMembersTable,
                and(
                  eq(
                    conversationMembersTable.contactId,
                    conversationsTable.contactId
                  ),
                  eq(conversationMembersTable.userId, user.id),
                  input.unread
                    ? gt(
                        conversationsTable.createdAt,
                        conversationMembersTable.lastReadAt
                      )
                    : undefined
                )
              )
              .leftJoin(
                contactsTable,
                eq(contactsTable.id, conversationsTable.contactId)
              )
              .as("sub");

            const data = await tx
              .select()
              .from(messages)
              .where(
                and(eq(sql<number>`"sub"."rn"`, 1), isNull(messages.deletedAt))
              )
              .limit(input.perPage)
              .offset(offset);

            const total = await tx
              .select({
                count: count(),
              })
              .from(messages)
              .where(
                and(eq(sql<number>`"sub"."rn"`, 1), isNull(messages.deletedAt))
              )
              .execute()
              .then((res) => res[0]?.count ?? 0);

            return {
              data,
              total,
            };
          }
        );

        const pageCount = Math.ceil(total / input.perPage);
        return { data, pageCount };
      } catch (error) {
        logger.error(error);
        return { data: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input), teamId],
    {
      revalidate: 10,
      tags: [`conversations:${teamId}`, "conversations"],
    }
  )();
}

export async function getConversationSearch(searchInput: string) {
  const defaultValue = { contacts: [], conversations: [] };

  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return defaultValue;
  }

  const { teamId } = userWithTeam;

  return unstable_cache(
    async () => {
      try {
        const { contacts, conversations } = await withTenantTransaction(
          teamId,
          async (tx) => {
            const contacts = await tx
              .select()
              .from(contactsTable)
              .where(
                and(
                  or(
                    ilike(contactsTable.name, `%${searchInput}%`),
                    ilike(contactsTable.phone, `%${searchInput}%`)
                  ),
                  isNull(contactsTable.deletedAt)
                )
              )
              .limit(10);

            const conversations = await tx
              .select()
              .from(conversationsTable)
              .where(
                and(
                  or(sql`similarity (body::text, '${searchInput}') > 0.1`),
                  isNull(conversationsTable.deletedAt)
                )
              )
              .limit(10);

            return {
              contacts,
              conversations,
            };
          }
        );

        return { contacts, conversations };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return defaultValue;
      }
    },
    [`${searchInput}:${teamId}`],
    {
      revalidate: 10,
      tags: [`${searchInput}:${teamId}`],
    }
  )();
}
