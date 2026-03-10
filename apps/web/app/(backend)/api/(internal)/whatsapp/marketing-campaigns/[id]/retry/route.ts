import { NextResponse } from "next/server";

import { getUserWithTeam } from "@/lib/db/queries";

// These functions would be called from the whatsapp-service
// For now, this is a placeholder API that returns campaign error data

async function getCampaignErrorLogsFromDB(teamId: string, marketingCampaignId: string) {
  // This would query the database for error logs
  // For now, return an empty array as the actual query is in the whatsapp-service
  return [];
}

async function getCampaignMessageStatsFromDB(teamId: string, marketingCampaignId: string) {
  // This would query the database for message stats
  return {
    pending: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
  };
}

export async function GET(
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
    return NextResponse.json(
      { error: "No Team" },
      { status: 400 }
    );
  }

  const { id } = await params;

  try {
    // Get failed messages and error summary
    const [errorLogs, messageStats] = await Promise.all([
      getCampaignErrorLogsFromDB(userWithTeam.teamId, id),
      getCampaignMessageStatsFromDB(userWithTeam.teamId, id),
    ]);

    return NextResponse.json({
      errorLogs,
      messageStats,
    });
  } catch (error) {
    console.error("Error fetching campaign retry data:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign data" },
      { status: 500 }
    );
  }
}

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
    return NextResponse.json(
      { error: "No Team" },
      { status: 400 }
    );
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { messageIds, retryAll = false } = body;

    // This would trigger the retry in the whatsapp-service
    // For now, return a success response
    // In a real implementation, you would call the service function or queue a retry job

    return NextResponse.json({
      success: true,
      retriedCount: retryAll ? -1 : (messageIds?.length || 0),
      message: retryAll
        ? "Retry all failed messages queued"
        : "Retry queued for specified messages",
    });
  } catch (error) {
    console.error("Error retrying campaign messages:", error);
    return NextResponse.json(
      { error: "Failed to retry messages" },
      { status: 500 }
    );
  }
}
