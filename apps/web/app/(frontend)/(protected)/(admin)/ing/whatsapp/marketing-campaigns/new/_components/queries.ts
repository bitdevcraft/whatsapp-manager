import {
  templatesTable,
  whatsAppBusinessAccountPhoneNumbersTable,
  withTenantTransaction,
} from "@workspace/db";
import { Template } from "@workspace/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";

import { getUserWithTeam } from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import { unstable_cache } from "@/lib/unstable-cache";

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
              .where(
                and(
                  eq(
                    whatsAppBusinessAccountPhoneNumbersTable.isRegistered,
                    true
                  ),
                  isNull(whatsAppBusinessAccountPhoneNumbersTable.deletedAt)
                )
              )
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
export async function getSelectTemplates(): Promise<{ templates: Template[] }> {
  const userWithTeam = await getUserWithTeam();

  const defaultValue: { templates: Template[] } = { templates: [] };

  if (!userWithTeam?.teamId) {
    return defaultValue;
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
              .where(
                and(
                  sql`${templatesTable.content} ->> 'status' ILIKE 'approved'`,
                  isNull(templatesTable.deletedAt)
                )
              )
              .orderBy(templatesTable.name);

            return { templates };
          }
        );

        return { templates };
      } catch (error) {
        logger.error(error);
        return defaultValue;
      }
    },
    [`templates:select:${teamId}`],
    {
      tags: [`templates:select:${teamId}`],
    }
  )();
}
