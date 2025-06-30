import { unstable_cache } from "@/lib/unstable-cache";
import { db } from "@workspace/db/config";
import {
  and,
  asc,
  count,
  desc,
  eq,
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

export async function getConversations(input: GetConversationSchema) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return { data: [], pageCount: 0 };
  }
  return await unstable_cache(
    async () => {
      try {
        if (!userWithTeam?.teamId) {
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
          userWithTeam?.teamId,
          async (tx) => {
            // const temp = await tx
            //   .select()
            //   .from(conversationsTable)
            //   .where(where)
            //   .limit(input.perPage)
            //   .offset(offset)
            //   .orderBy(...orderBy);

            const data = await tx.query.contactsTable.findMany({
              with: {
                conversations: {
                  where,
                  orderBy: (conversationsTable, { desc, asc }) => [
                    desc(conversationsTable.createdAt),
                  ],
                  limit: 1,
                },
              },
              orderBy: (conversationsTable, { asc }) => [
                asc(conversationsTable.createdAt),
              ],
            });

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
    [JSON.stringify(input), userWithTeam?.teamId],
    {
      revalidate: 1,
      tags: ["conversations", `conversations:${userWithTeam?.teamId}`],
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
