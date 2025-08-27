import { tagsTable } from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import { filterColumns } from "@workspace/ui/lib/filter-columns";
import { and, asc, count, desc, gte, ilike, lte } from "drizzle-orm";

import { getUserWithTeam } from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import { unstable_cache } from "@/lib/unstable-cache";

import { GetTagSchema } from "./validations";

export async function getSelectTags() {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return [];
  }

  const { teamId } = userWithTeam;

  return await unstable_cache(
    async () => {
      try {
        const tags = await withTenantTransaction(teamId, async (tx) => {
          const data = await tx
            .select({
              label: tagsTable.name,
              value: tagsTable.normalizedName,
            })
            .from(tagsTable)
            .orderBy(tagsTable.name);

          const tags: { label: string; value: string }[] = data.map((t) => ({
            label: t.label,
            value: t.value || "",
          }));

          return tags;
        });

        return tags;
      } catch (error) {
        logger.error(error);
        return [];
      }
    },
    [`tags:select:${teamId}`],
    {
      revalidate: 1,
      tags: [`tags:select:${teamId}`, "tags:select"],
    }
  )();
}

export async function getTags(input: GetTagSchema) {
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
          table: tagsTable,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.name ? ilike(tagsTable.name, `%${input.name}%`) : undefined,
              input.createdAt.length > 0
                ? and(
                    input.createdAt[0]
                      ? gte(
                          tagsTable.createdAt,
                          (() => {
                            const date = new Date(input.createdAt[0]);
                            date.setHours(0, 0, 0, 0);
                            return date;
                          })()
                        )
                      : undefined,
                    input.createdAt[1]
                      ? lte(
                          tagsTable.createdAt,
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
                item.desc ? desc(tagsTable[item.id]) : asc(tagsTable[item.id])
              )
            : [asc(tagsTable.createdAt)];

        const { data, total } = await withTenantTransaction(
          userWithTeam?.teamId,
          async (tx) => {
            const data = await tx
              .select()
              .from(tagsTable)
              .where(where)
              .limit(input.perPage)
              .offset(offset)
              .orderBy(...orderBy);

            const total = await tx
              .select({
                count: count(),
              })
              .from(tagsTable)
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
      tags: [`tags:${userWithTeam?.teamId}`, "tags"],
    }
  )();
}
