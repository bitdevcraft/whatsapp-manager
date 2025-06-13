import { getUserWithTeam } from "@/lib/db/queries";
import { db } from "@workspace/db/index";
import { marketingCampaignsTable, templatesTable } from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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
    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }
  const { id } = await params;

  try {
    const data = await withTenantTransaction(
      userWithTeam?.teamId,
      async (tx) => {
        const data = await tx.query.marketingCampaignsTable.findFirst({
          where: eq(marketingCampaignsTable.id, id),
          with: {
            template: true,
          },
        });

        return { data };
      }
    );
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response("", { status: 400 });
  }
}
