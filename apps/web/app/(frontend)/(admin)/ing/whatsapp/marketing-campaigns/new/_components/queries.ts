import { getUserWithTeam } from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import { unstable_cache } from "@/lib/unstable-cache";
import {
  tagsTable,
  templatesTable,
  whatsAppBusinessAccountPhoneNumbersTable,
  withTenantTransaction,
} from "@workspace/db";
import { Label } from "recharts";

export async function getSelectTags() {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return { tags: [] };
  }

  const { teamId } = userWithTeam;

  return await unstable_cache(
    async () => {
      try {
        const { tags } = await withTenantTransaction(teamId, async (tx) => {
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

          return { tags };
        });

        return { tags };
      } catch (error) {
        logger.error(error);
        return { tags: [] };
      }
    },
    [`tags:select:${teamId}`],
    {
      tags: [`tags:select:${teamId}`],
    }
  )();
}
export async function getSelectTemplates() {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return { templates: [] };
  }

  const { teamId } = userWithTeam;

  return await unstable_cache(
    async () => {
      try {
        const { templates } = await withTenantTransaction(
          teamId,
          async (tx) => {
            const templates = await tx
              .select()
              .from(templatesTable)
              .orderBy(templatesTable.name);

            return { templates };
          }
        );

        return { templates };
      } catch (error) {
        logger.error(error);
        return { templates: [] };
      }
    },
    [`templates:select:${teamId}`],
    {
      tags: [`templates:select:${teamId}`],
    }
  )();
}
export async function getSelectPhoneNumber() {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return { phoneNumbers: [] };
  }

  const { teamId } = userWithTeam;

  return await unstable_cache(
    async () => {
      try {
        const { phoneNumbers } = await withTenantTransaction(
          teamId,
          async (tx) => {
            const phoneNumbers = await tx
              .select({
                label:
                  whatsAppBusinessAccountPhoneNumbersTable.displayPhoneNumber,
                value: whatsAppBusinessAccountPhoneNumbersTable.id,
              })
              .from(whatsAppBusinessAccountPhoneNumbersTable)
              .orderBy(
                whatsAppBusinessAccountPhoneNumbersTable.displayPhoneNumber
              );

            return { phoneNumbers };
          }
        );

        return { phoneNumbers };
      } catch (error) {
        logger.error(error);
        return { phoneNumbers: [] };
      }
    },
    [`phoneNumbers:select:${teamId}`],
    {
      tags: [`phoneNumbers:select:${teamId}`],
    }
  )();
}
