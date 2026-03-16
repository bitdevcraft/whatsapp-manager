"use server";

import { contactsTable, tagsTable } from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import { inArray, sql } from "drizzle-orm";
import { revalidateTag, unstable_noStore } from "next/cache";
import { toast } from "sonner";

import { getUserWithTeam } from "@/lib/db/queries";
import { getErrorMessage } from "@/lib/handle-error";
import { logger } from "@/lib/logger";
import { unstable_cache } from "@/lib/unstable-cache";

export async function deleteTags(input: { ids: string[] }) {
  unstable_noStore();
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    toast.error("There is no team");
    return {
      data: null,
      error: null,
    };
  }

  try {
    await withTenantTransaction(userWithTeam.teamId, async (tx) => {
      const tags = await tx
        .update(tagsTable)
        .set({
          deletedAt: new Date(),
        })
        .where(inArray(tagsTable.id, input.ids))
        .returning();

      const removeTags = tags.map((tag) => tag.normalizedName) as string[];

      await tx.update(contactsTable).set({
        tags: sql`
        (
          SELECT COALESCE(jsonb_agg(elem ORDER BY ord), '[]'::jsonb)
          FROM jsonb_array_elements_text(COALESCE(${contactsTable.tags}, '[]'::jsonb))
              WITH ORDINALITY AS t(elem, ord)
          WHERE NOT (
            elem = ANY(
              ${
                removeTags.length
                  ? sql`ARRAY[${sql.join(
                      removeTags.map((t) => sql`${t}`),
                      sql`, `
                    )}]::text[]`
                  : sql`ARRAY[]::text[]`
              }
            )
          )
        )
                            `,
        updatedAt: new Date(),
      });
    });

    revalidateTag(`contacts:tags:${userWithTeam.teamId}`, "max");
    revalidateTag(`tags:select:${userWithTeam.teamId}`, "max");
    revalidateTag(`tags:${userWithTeam.teamId}`, "max");
    revalidateTag(`contacts:${userWithTeam.teamId}`, "max");

    return {
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}

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
      tags: [`contacts:tags:${userWithTeam?.teamId}`, "contacts:tags"],
    }
  )();
}
