import { MarketingCampaignFormValues } from "@/features/marketing-campaigns/_lib/schema";
import { getMarketingCampaigns } from "@/features/marketing-campaigns/get-marketing-campaigns";
import { getUserWithTeam } from "@/lib/db/queries";
import {
  marketingCampaignsTable,
  NewMarketingCampaign,
} from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import { NextResponse } from "next/server";
import { IJobMessageOutgoing, WhatsAppEvents } from "@workspace/shared";
import { revalidateTag } from "next/cache";
import { RESPONSE_CODE } from "@/lib/constants/response-code";
import { waBulkMessagesOutgoingQueue } from "@/jobs/queues";

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

  try {
    await revalidateTag(`marketing-campaigns:${userWithTeam?.teamId}`);

    const body = (await request.json()) as MarketingCampaignFormValues;

    const result = await withTenantTransaction(
      userWithTeam?.teamId,
      async (tx) => {
        const marketingCampaign: NewMarketingCampaign = {
          name: body.details.campaignName,
          templateId: body.template.template,
          scheduleAt: body.details.schedule
            ? new Date(body.details.schedule)
            : null,
          recipients: body.audience.phone.map((phone) => phone.value),
          tags: body.audience.tags,
          enableTracking: body.details.track,
          phoneNumber: body.details.phoneNumber,
          status: body.details.schedule ? "pending" : "draft",
          messageTemplate: body.template.messageTemplate,
          teamId: userWithTeam.teamId!,
        };

        const data = await tx
          .insert(marketingCampaignsTable)
          .values([marketingCampaign])
          .returning({ id: marketingCampaignsTable.id });

        return {
          data: data[0],
        };
      }
    );

    if (result?.data?.id && body.details.schedule) {
      const jobData: IJobMessageOutgoing = {
        teamId: userWithTeam.teamId,
        marketingCampaignId: result.data.id,
        userId: userWithTeam.user.id,
      };

      const jobId = `${WhatsAppEvents.BulkMessagesOutgoing}:${userWithTeam.teamId}:${result.data.id}`;

      const delay = Math.max(
        0,
        new Date(body.details.schedule).getTime() - Date.now()
      );

      await waBulkMessagesOutgoingQueue.add(jobId, jobData, {
        jobId,
        delay,
      });
    }

    return new Response(JSON.stringify(result), {
      status: RESPONSE_CODE.SUCCESS,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new Response("", { status: RESPONSE_CODE.BAD_REQUEST });
  }
}
