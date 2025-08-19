import { unstable_cache } from "@/lib/unstable-cache";
import { withTenantTransaction } from "@workspace/db/tenant";
import { and, asc, count, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { contactsTable } from "@workspace/db/schema/contacts";
import { filterColumns } from "@workspace/ui/lib/filter-columns";
import { GetContactSchema } from "./validations";
import { getUserWithTeam } from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import { Contact, Conversation, conversationsTable } from "@workspace/db";

export async function getContacts(input: GetContactSchema) {
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
          table: contactsTable,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        logger.log("RYAN", input.tags);

        const where = advancedTable
          ? advancedWhere
          : and(
              input.name
                ? ilike(contactsTable.name, `%${input.name}%`)
                : undefined,
              input.tags.length > 0
                ? sql`${contactsTable.tags} ?| ARRAY[${sql.join(
                    input.tags.map((v) => sql`${v}`),
                    sql`, `
                  )}]`
                : undefined,
              input.createdAt.length > 0
                ? and(
                    input.createdAt[0]
                      ? gte(
                          contactsTable.createdAt,
                          (() => {
                            const date = new Date(input.createdAt[0]);
                            date.setHours(0, 0, 0, 0);
                            return date;
                          })()
                        )
                      : undefined,
                    input.createdAt[1]
                      ? lte(
                          contactsTable.createdAt,
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
                  ? desc(contactsTable[item.id])
                  : asc(contactsTable[item.id])
              )
            : [asc(contactsTable.createdAt)];

        const { data, total } = await withTenantTransaction(
          userWithTeam?.teamId,
          async (tx) => {
            const data = await tx
              .select()
              .from(contactsTable)
              .where(where)
              .limit(input.perPage)
              .offset(offset)
              .orderBy(...orderBy);

            const total = await tx
              .select({
                count: count(),
              })
              .from(contactsTable)
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
      revalidate: 10,
      tags: [`contacts:${userWithTeam?.teamId}`, "contacts"],
    }
  )();
}

export async function getContactById(id: string): Promise<{
  data: Contact | undefined;
  conversation: Conversation | undefined;
}> {
  const defaultValue: {
    data: Contact | undefined;
    conversation: Conversation | undefined;
  } = { data: undefined, conversation: undefined };

  if (!id) return defaultValue;

  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return defaultValue;
  }

  const { teamId } = userWithTeam;

  return await unstable_cache(
    async () => {
      try {
        const { contact, conversation } = await withTenantTransaction(
          teamId,
          async (tx) => {
            const contact = await tx.query.contactsTable.findFirst({
              where: eq(contactsTable.id, id),
            });

            const conversation = await tx.query.conversationsTable.findFirst({
              where: and(
                eq(conversationsTable.contactId, id),
                eq(conversationsTable.direction, "inbound")
              ),
              orderBy: (conversationsTable, { desc }) => [
                desc(conversationsTable.createdAt),
              ],
            });

            return { contact, conversation };
          }
        );

        return { data: contact, conversation };
      } catch (error) {
        console.error(error);
        return defaultValue;
      }
    },
    [id],
    {
      tags: [id],
      revalidate: 1,
    }
  )();
}
