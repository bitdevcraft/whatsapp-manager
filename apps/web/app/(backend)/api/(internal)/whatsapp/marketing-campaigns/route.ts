import { MarketingCampaignFormValues } from "@/features/marketing-campaigns/_lib/schema";
import { getMarketingCampaigns } from "@/features/marketing-campaigns/get-marketing-campaigns";
import { getUserWithTeam } from "@/lib/db/queries";
import { db } from "@workspace/db";
import {
  marketingCampaignsTable,
  NewMarketingCampaign,
  templatesTable,
} from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await getMarketingCampaigns();
  return new Response(JSON.stringify(result), { status: 200 });
}

export async function POST(request: Request) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!userWithTeam.teamId) {
    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  const body = (await request.json()) as MarketingCampaignFormValues;

  console.log(body);

  const data = await withTenantTransaction(userWithTeam?.teamId, async (tx) => {
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
      teamId: userWithTeam.teamId!,
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
