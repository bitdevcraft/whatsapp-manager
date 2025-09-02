import { and, eq, isNull, sql } from "drizzle-orm";

import { contactsTable, marketingCampaignsTable } from "../schema";
import { withTenantTransaction } from "../tenant";

export class ContactRepository {
  constructor(private readonly teamId: string) {}

  async countContactByMarketingCampaignId(id: string) {
    return withTenantTransaction(this.teamId, async (tx) => {
      const marketingCampaign =
        await tx.query.marketingCampaignsTable.findFirst({
          where: eq(marketingCampaignsTable.id, id),
        });

      if (!marketingCampaign) return 0;

      if (!marketingCampaign.tags || marketingCampaign.tags.length === 0)
        return marketingCampaign.recipients?.length ?? 0;

      const result = await tx
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(contactsTable)
        .where(
          and(
            sql`${contactsTable.tags} ?| ARRAY[${sql.join(
              marketingCampaign.tags.map((v) => sql`${v}`),
              sql`, `
            )}]`,
            isNull(contactsTable.deletedAt)
          )
        );

      return (
        Number(result[0]?.count ?? 0) +
        Number(marketingCampaign.recipients?.length ?? 0)
      );
    });
  }

  async countContactByTags(tags: string[]) {
    return withTenantTransaction(this.teamId, async (tx) => {
      if (tags.length === 0) return 0;
      const result = await tx
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(contactsTable)
        .where(
          and(
            sql`${contactsTable.tags} ?| ARRAY[${sql.join(
              tags.map((v) => sql`${v}`),
              sql`, `
            )}]`,
            isNull(contactsTable.deletedAt)
          )
        );

      return result[0]?.count ?? 0;
    });
  }
}
