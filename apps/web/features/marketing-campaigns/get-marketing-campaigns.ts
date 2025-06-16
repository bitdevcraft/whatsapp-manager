import { db } from "@workspace/db/config";
import { marketingCampaignsTable } from "@workspace/db/schema/marketing-campaigns";

export async function getMarketingCampaigns() {
  return await db.select().from(marketingCampaignsTable);
}
