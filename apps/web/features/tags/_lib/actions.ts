import { getUserWithTeam } from "@/lib/db/queries";
import { unstable_cache } from "@/lib/unstable-cache";
import { withTenantTransaction } from "@workspace/db/tenant";
import { tagsTable } from "@workspace/db/schema";
import { logger } from "@/lib/logger";

export async function getTags() {
  const userWithTeam = await getUserWithTeam();

  logger.log("Ryan");
  if (!userWithTeam?.teamId) {
    return { data: [] };
  }

  return await unstable_cache(
    async () => {
      try {
        const data = await withTenantTransaction(
          userWithTeam.teamId!,
          async (tx) => {
            return await tx
              .select({
                name: tagsTable.name,
                normalName: tagsTable.normalizedName,
              })
              .from(tagsTable);
          }
        );

        logger.log(data);

        return {
          data,
        };
      } catch {
        return {
          data: [],
        };
      }
    },
    [`contacts:tags:${userWithTeam?.teamId}`],
    {
      revalidate: 1,
      tags: ["contacts:tags", `contacts:tags:${userWithTeam?.teamId}`],
    }
  )();
}
