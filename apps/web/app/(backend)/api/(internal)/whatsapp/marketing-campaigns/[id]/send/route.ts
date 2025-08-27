import { IJobMessageOutgoing, WhatsAppEvents } from "@workspace/shared";
import { NextResponse } from "next/server";

import { waBulkMessagesOutgoingQueue } from "@/jobs/queues";
import { getUserWithTeam } from "@/lib/db/queries";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
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
  const { id } = await params;

  const jobId = `${WhatsAppEvents.MessagesOutgoing}:${userWithTeam.teamId}:${id}`;

  const delay = Math.max(
    0
    // new Date(body.details.schedule).getTime() - Date.now()
  );

  const jobData: IJobMessageOutgoing = {
    marketingCampaignId: id,
    teamId: userWithTeam.teamId,
    userId: userWithTeam.user.id,
  };

  await waBulkMessagesOutgoingQueue.add(jobId, jobData, {
    delay,
    jobId,
  });

  return new Response("", { status: 200 });
}
