import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import { marketingCampaignsTable, templatesTable, whatsAppBusinessAccountsTable } from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import WhatsApp, { WhatsAppConfig } from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const userWithTeam = await getUserWithTeam();

    if (!userWithTeam) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (!userWithTeam.teamId) {
      return new Response("", {
        status: 401,
        statusText: "No Team",
      });
    }
    const { id } = await params;

    const body = (await request.json()) as string[];

    const { teamId } = userWithTeam;

    const marketingCampaign = await withTenantTransaction(
      teamId,
      async (tx) => {
        return await tx.query.marketingCampaignsTable.findFirst({
          where: eq(marketingCampaignsTable.id, id),
        });
      }
    );

    if (!marketingCampaign) {
      return new Response("", {
        status: 400,
      });
    }

    const { messageTemplate, templateId } = marketingCampaign;

    const { account, template } = await withTenantTransaction(
      teamId,
      async (tx) => {
        const account = await tx.query.whatsAppBusinessAccountsTable.findFirst({
          with: {
            team: {
              with: {
                waBusinessPhoneNumber: true,
              },
            },
          },
          where: eq(whatsAppBusinessAccountsTable.teamId, teamId),
        });

        const template = await tx.query.templatesTable.findFirst({
          where: eq(templatesTable.id, templateId),
        });

        return { account, template };
      }
    );

    if (
      !account ||
      !account.accessToken ||
      !account.team.waBusinessPhoneNumber[0]
    )
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, iv } = account.accessToken;

    const decryptAccessToken = await decryptApiKey({
      iv,
      data,
    });

    const config: WhatsAppConfig = {
      accessToken: decryptAccessToken,
      businessAcctId: String(account.id),
      phoneNumberId: account.team.waBusinessPhoneNumber[0].id,
    };

    const whatsapp = new WhatsApp(config);

    //
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.flatten() }, { status: 400 });
    }

    // 5. Log & return generic 500
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
