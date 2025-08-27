import { Template } from "@workspace/db";
import { templatesTable } from "@workspace/db/schema/templates";
import { withTenantTransaction } from "@workspace/db/tenant";
import { filterColumns } from "@workspace/ui/lib/filter-columns";
import { and, asc, count, desc, eq, gte, ilike, lte } from "drizzle-orm";

import { getUserWithTeam } from "@/lib/db/queries";
import { unstable_cache } from "@/lib/unstable-cache";

import { GetTemplateSchema } from "./validations";

export async function getAllTemplates(input: GetTemplateSchema) {
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
        const advancedTable = input.filterFlag === "advancedFilters";

        const advancedWhere = filterColumns({
          filters: input.filters,
          joinOperator: input.joinOperator,
          table: templatesTable,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.name
                ? ilike(templatesTable.name, `%${input.name}%`)
                : undefined,
              input.createdAt.length > 0
                ? and(
                    input.createdAt[0]
                      ? gte(
                          templatesTable.createdAt,
                          (() => {
                            const date = new Date(input.createdAt[0]);
                            date.setHours(0, 0, 0, 0);
                            return date;
                          })()
                        )
                      : undefined,
                    input.createdAt[1]
                      ? lte(
                          templatesTable.createdAt,
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
                  ? desc(templatesTable[item.id])
                  : asc(templatesTable[item.id])
              )
            : [asc(templatesTable.createdAt)];

        const { data, total } = await withTenantTransaction(
          userWithTeam?.teamId,
          async (tx) => {
            const data = await tx
              .select()
              .from(templatesTable)
              .where(where)
              .limit(input.perPage)
              .orderBy(...orderBy);

            const total = await tx
              .select({
                count: count(),
              })
              .from(templatesTable)
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return { data: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input), `templates:${userWithTeam?.teamId}`],
    {
      revalidate: 10,
      tags: ["templates", `templates:${userWithTeam?.teamId}`],
    }
  )();
}

export async function getTemplateById(
  id: string
): Promise<null | Template | undefined> {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return null;
  }

  const { teamId } = userWithTeam;

  return unstable_cache(
    async () => {
      try {
        return await withTenantTransaction(teamId, async (tx) => {
          return tx.query.templatesTable.findFirst({
            where: eq(templatesTable.id, id),
          });
        });
      } catch (error) {
        return null;
      }
    },
    [id],
    {
      revalidate: 10,
      tags: [id],
    }
  )();
}

export async function getTemplates(input: GetTemplateSchema) {
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
          filters: input.filters,
          joinOperator: input.joinOperator,
          table: templatesTable,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.name
                ? ilike(templatesTable.name, `%${input.name}%`)
                : undefined,
              input.createdAt.length > 0
                ? and(
                    input.createdAt[0]
                      ? gte(
                          templatesTable.createdAt,
                          (() => {
                            const date = new Date(input.createdAt[0]);
                            date.setHours(0, 0, 0, 0);
                            return date;
                          })()
                        )
                      : undefined,
                    input.createdAt[1]
                      ? lte(
                          templatesTable.createdAt,
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
                  ? desc(templatesTable[item.id])
                  : asc(templatesTable[item.id])
              )
            : [asc(templatesTable.createdAt)];

        const { data, total } = await withTenantTransaction(
          userWithTeam?.teamId,
          async (tx) => {
            const data = await tx
              .select()
              .from(templatesTable)
              .where(where)
              .limit(input.perPage)
              .offset(offset)
              .orderBy(...orderBy);

            const total = await tx
              .select({
                count: count(),
              })
              .from(templatesTable)
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return { data: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input), userWithTeam?.teamId],
    {
      revalidate: 1,
      tags: [`templates:${userWithTeam?.teamId}`, "templates"],
    }
  )();
}
