import { RESPONSE_CODE } from "@/lib/constants/response-code";
import { getUserWithTeam } from "@/lib/db/queries";
import { db } from "@workspace/db/config";
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

  const { name } = (await request.json()) as { name: string };

  const { id } = await params;

  const { teamId } = userWithTeam;

  try {
    const result = await withTenantTransaction(teamId, async (tx) => {
      const data = await tx.query.marketingCampaignsTable.findFirst({
        where: eq(marketingCampaignsTable.id, id),
        columns: {
          name: true,
          templateId: true,
          recipients: true,
          tags: true,
          enableTracking: true,
          phoneNumber: true,
          status: true,
          messageTemplate: true,
          teamId: true,
        },
      });

      if (data) {
        const result = await tx
          .insert(marketingCampaignsTable)
          .values([{ ...data, name }])
          .returning({ id: marketingCampaignsTable.id });

        return {
          data: result[0],
        };
      }

      return {
        data: null,
      };
    });

    return new Response(JSON.stringify(result), {
      status: RESPONSE_CODE.SUCCESS,
    });
  } catch (error) {
    return new Response("", { status: RESPONSE_CODE.BAD_REQUEST });
  }
}
