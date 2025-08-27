import {
  marketingCampaignsTable,
  NewMarketingCampaign,
} from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import { IJobMessageOutgoing, WhatsAppEvents } from "@workspace/shared";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { MarketingCampaignFormValues } from "@/features/marketing-campaigns/_lib/schema";
import { waBulkMessagesOutgoingQueue } from "@/jobs/queues";
import { RESPONSE_CODE } from "@/lib/constants/response-code";
import { getUserWithTeam } from "@/lib/db/queries";

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
          enableTracking: body.details.track,
          messageTemplate: body.template.messageTemplate,
          name: body.details.campaignName,
          phoneNumber: body.details.phoneNumber,
          recipients: body.audience.phone.map((phone) => phone.value),
          scheduleAt: body.details.schedule
            ? new Date(body.details.schedule)
            : null,
          status: body.details.schedule ? "pending" : "draft",
          tags: body.audience.tags,
          teamId: userWithTeam.teamId!,
          templateId: body.template.template,
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
        marketingCampaignId: result.data.id,
        teamId: userWithTeam.teamId,
        userId: userWithTeam.user.id,
      };

      const jobId = `${WhatsAppEvents.BulkMessagesOutgoing}:${userWithTeam.teamId}:${result.data.id}`;

      const delay = Math.max(
        0,
        new Date(body.details.schedule).getTime() - Date.now()
      );

      await waBulkMessagesOutgoingQueue.add(jobId, jobData, {
        delay,
        jobId,
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
