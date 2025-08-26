import { eq, sql } from "drizzle-orm";

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

      const result = await tx
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(contactsTable)
        .where(
          sql`${contactsTable.tags} ?| ARRAY[${sql.join(
            marketingCampaign.tags?.map((v) => sql`${v}`) ?? [],
            sql`, `
          )}]`
        );

      return (
        Number(result[0]?.count ?? 0) +
        Number(marketingCampaign.recipients?.length ?? 0)
      );
    });
  }

  async countContactByTags(tags: string[]) {
    return withTenantTransaction(this.teamId, async (tx) => {
      const result = await tx
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(contactsTable)
        .where(
          sql`${contactsTable.tags} ?| ARRAY[${sql.join(
            tags.map((v) => sql`${v}`),
            sql`, `
          )}]`
        );

      return result[0]?.count ?? 0;
    });
  }
}
