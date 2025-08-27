import { whatsAppBusinessAccountPhoneNumbersTable } from "@workspace/db";
import { withTenantTransaction } from "@workspace/db/tenant";
import { filterColumns } from "@workspace/ui/lib/filter-columns";
import { and, asc, count, desc, gte, ilike, lte } from "drizzle-orm";

import { getUserWithTeam } from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import { unstable_cache } from "@/lib/unstable-cache";

import { GetWaPhoneNumberSchema } from "./validation";

export async function getWhatsAppBusinessAccountPhoneNumber(
  input: GetWaPhoneNumberSchema
) {
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
          table: whatsAppBusinessAccountPhoneNumbersTable,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.displayPhoneNumber
                ? ilike(
                    whatsAppBusinessAccountPhoneNumbersTable.displayPhoneNumber,
                    `%${input.displayPhoneNumber}%`
                  )
                : undefined,
              input.createdAt.length > 0
                ? and(
                    input.createdAt[0]
                      ? gte(
                          whatsAppBusinessAccountPhoneNumbersTable.createdAt,
                          (() => {
                            const date = new Date(input.createdAt[0]);
                            date.setHours(0, 0, 0, 0);
                            return date;
                          })()
                        )
                      : undefined,
                    input.createdAt[1]
                      ? lte(
                          whatsAppBusinessAccountPhoneNumbersTable.createdAt,
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
                  ? desc(whatsAppBusinessAccountPhoneNumbersTable[item.id])
                  : asc(whatsAppBusinessAccountPhoneNumbersTable[item.id])
              )
            : [asc(whatsAppBusinessAccountPhoneNumbersTable.createdAt)];

        const { data, total } = await withTenantTransaction(
          userWithTeam?.teamId,
          async (tx) => {
            const data = await tx
              .select()
              .from(whatsAppBusinessAccountPhoneNumbersTable)
              .where(where)
              .limit(input.perPage)
              .offset(offset)
              .orderBy(...orderBy);

            const total = await tx
              .select({
                count: count(),
              })
              .from(whatsAppBusinessAccountPhoneNumbersTable)
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
      tags: ["phone-number", `phone-number:${userWithTeam?.teamId}`],
    }
  )();
}
