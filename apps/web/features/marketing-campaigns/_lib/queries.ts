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
import { filterColumns } from "@workspace/ui/lib/filter-columns";
import { GetMarketingCampaignSchema } from "./validations";
import { getUserWithTeam } from "@/lib/db/queries";
import { withTenantTransaction } from "@workspace/db/tenant";
import { marketingCampaignsTable } from "@workspace/db/schema";
import { logger } from "@/lib/logger";

export async function getMarketingCampaigns(input: GetMarketingCampaignSchema) {
  const userWithTeam = await getUserWithTeam();
  if (!userWithTeam?.teamId) {
    return { data: [], pageCount: 0 };
  }
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
          table: marketingCampaignsTable,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.name
                ? ilike(marketingCampaignsTable.name, `%${input.name}%`)
                : undefined,
              input.createdAt.length > 0
                ? and(
                    input.createdAt[0]
                      ? gte(
                          marketingCampaignsTable.createdAt,
                          (() => {
                            const date = new Date(input.createdAt[0]);
                            date.setHours(0, 0, 0, 0);
                            return date;
                          })()
                        )
                      : undefined,
                    input.createdAt[1]
                      ? lte(
                          marketingCampaignsTable.createdAt,
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
                  ? desc(marketingCampaignsTable[item.id])
                  : asc(marketingCampaignsTable[item.id])
              )
            : [asc(marketingCampaignsTable.createdAt)];

        const { data, total } = await withTenantTransaction(
          userWithTeam?.teamId,
          async (tx) => {
            const data = await tx
              .select()
              .from(marketingCampaignsTable)
              .where(where)
              .limit(input.perPage)
              .offset(offset)
              .orderBy(...orderBy);

            const total = await tx
              .select({
                count: count(),
              })
              .from(marketingCampaignsTable)
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
      tags: [
        "marketing-campaigns",
        `marketing-campaigns:${userWithTeam?.teamId}`,
      ],
    }
  )();
}
