import { getUserWithTeam } from "@/lib/db/queries";
import {
  IJobMessageOutgoing,
  waMessagesOutgoingQueue,
  WhatsAppEvents,
} from "@workspace/shared";
import { NextResponse } from "next/server";

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
    teamId: userWithTeam.teamId,
    marketingCampaignId: id,
  };

  await waMessagesOutgoingQueue.add(jobId, jobData, {
    jobId,
    delay,
  });

  return new Response("", { status: 200 });
}
