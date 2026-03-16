import { marketingCampaignsTable } from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { RESPONSE_CODE } from "@/lib/constants/response-code";
import { getUserWithTeam } from "@/lib/db/queries";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        columns: {
          enableTracking: true,
          messageTemplate: true,
          name: true,
          phoneNumber: true,
          recipients: true,
          tags: true,
          teamId: true,
          templateId: true,
        },
        where: eq(marketingCampaignsTable.id, id),
      });

      if (data) {
        const result = await tx
          .insert(marketingCampaignsTable)
          .values([{ ...data, name, status: "draft" }])
          .returning({ id: marketingCampaignsTable.id });

        return {
          data: result[0],
        };
      }

      return {
        data: null,
      };
    });

    revalidateTag(`marketing-campaigns:${userWithTeam?.teamId}`, "max");

    if (!result.data) {
      return new Response("", {
        status: RESPONSE_CODE.BAD_REQUEST,
        statusText: "nothing to clone",
      });
    }

    return new Response(JSON.stringify(result), {
      status: RESPONSE_CODE.SUCCESS,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response("", {
      status: RESPONSE_CODE.BAD_REQUEST,
      statusText: error.message,
    });
  }
}
