import { waBulkMessagesOutgoingQueue } from "@/jobs/queues";
import { getUserWithTeam } from "@/lib/db/queries";
import { WhatsAppEvents } from "@workspace/shared";
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

  await waBulkMessagesOutgoingQueue.remove(jobId);

  return new Response("", { status: 200 });
}
