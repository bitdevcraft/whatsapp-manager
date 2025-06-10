import { MarketingCampaignFormValues } from "@/features/marketing-campaigns/_lib/schema";
import { getMarketingCampaigns } from "@/features/marketing-campaigns/get-marketing-campaigns";
import { db } from "@workspace/db";
import {
  marketingCampaignsTable,
  NewMarketingCampaign,
  templatesTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const result = await getMarketingCampaigns();
  return new Response(JSON.stringify(result), { status: 200 });
}

export async function POST(request: Request) {
  const body = (await request.json()) as MarketingCampaignFormValues;

  console.log(body);

  const data = await db.transaction(async (tx) => {
    const template = await tx.query.templatesTable.findFirst({
      where: eq(templatesTable.name, body.template.template),
    });

    if (!template) return { data: {} };

    const marketingCampaign: NewMarketingCampaign = {
      name: body.details.campaignName,
      templateId: template.id,
      scheduleAt: body.details.schedule
        ? new Date(body.details.schedule)
        : null,
      recipients: body.audience.phone.map((phone) => phone.value),
      tags: body.audience.tags,
      enableTracking: body.details.track,
      phoneNumber: body.details.phoneNumber,
      status: body.details.schedule ? "pending" : "draft",
    };

    const data = await tx
      .insert(marketingCampaignsTable)
      .values([marketingCampaign])
      .returning({ id: marketingCampaignsTable.id });

    return {
      data,
    };
  });
  return new Response(JSON.stringify(data), { status: 200 });
}
