import { unstable_cache } from "@/lib/unstable-cache";
import { db } from "@workspace/db/config";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  ilike,
  inArray,
  lte,
  sql,
} from "drizzle-orm";
import { conversationsTable } from "@workspace/db/schema/conversations";
import { filterColumns } from "@workspace/ui/lib/filter-columns";
import { GetConversationSchema } from "./validations";
import { getUserWithTeam } from "@/lib/db/queries";
import { withTenantTransaction } from "@workspace/db/tenant";
import { logger } from "@/lib/logger";
import { contactsTable, conversationMembersTable } from "@workspace/db";
import { ConversationContact } from "./types";

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
        const advancedTable = input.filterFlag === "advancedFilters";

        const advancedWhere = filterColumns({
          table: conversationsTable,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.createdAt.length > 0
                ? and(
                    input.createdAt[0]
                      ? gte(
                          conversationsTable.createdAt,
                          (() => {
                            const date = new Date(input.createdAt[0]);
                            date.setHours(0, 0, 0, 0);
                            return date;
                          })()
                        )
                      : undefined,
                    input.createdAt[1]
                      ? lte(
                          conversationsTable.createdAt,
                          (() => {
                            const date = new Date(input.createdAt[1]);
                            date.setHours(23, 59, 59, 999);
                            return date;
                          })()
                        )
                      : undefined
                  )
                : undefined
            );

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc
                  ? desc(conversationsTable[item.id])
                  : asc(conversationsTable[item.id])
              )
            : [asc(conversationsTable.createdAt)];

        const { data, total } = await withTenantTransaction(
          teamId,
          async (tx) => {
            const data = await tx
              .select()
              .from(
                tx
                  .select({
                    // ...getTableColumns(conversationsTable),
                    id: contactsTable.id,
                    message: conversationsTable.body,
                    createdAt: conversationsTable.createdAt,
                    contact: {
                      name: contactsTable.name,
                      phone: contactsTable.phone,
                    },
                    isUnread: sql<boolean>`
                      (${conversationsTable.createdAt} > ${conversationMembersTable.lastReadAt})
                    `.as("isUnread"),
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
                  .as("sub")
              )
              .where(eq(sql<number>`"sub"."rn"`, 1));

            const total = await tx
              .select({
                count: count(),
              })
              .from(conversationsTable)
              .where(where)
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
      revalidate: 1,
      tags: ["conversations", `conversations:${teamId}`],
    }
  )();
}

export async function getContactConversation(contact: string) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return [];
  }

  const { teamId } = userWithTeam;

  return await unstable_cache(
    async () => {
      try {
        const data = await withTenantTransaction(teamId, async (tx) => {
          const data = await tx.query.conversationsTable.findMany({
            where: eq(conversationsTable.contactId, contact),
            orderBy: (conversationsTable, { asc }) => [
              asc(conversationsTable.createdAt),
            ],
            with: {
              user: true,
            },
          });

          return data;
        });

        return data;
      } catch (error) {
        return [];
      }
    },
    [JSON.stringify(contact), teamId],
    {
      revalidate: 1,
      tags: [
        "conversations",
        `conversations:${teamId}`,
        `conversations:${teamId}:${contact}`,
      ],
    }
  )();
}
