import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import {
  withTenantTransaction,
  whatsAppBusinessAccountsTable,
} from "@workspace/db";
import WhatsApp, { WhatsAppConfig } from "@workspace/wa-cloud-api";
import { TemplateRequestBody } from "@workspace/wa-cloud-api/template";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(request: Request) {
  try {
    const userWithTeam = await getUserWithTeam();

    if (!userWithTeam?.teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = userWithTeam;
    const body = (await request.json()) as TemplateRequestBody;

    const { account } = await withTenantTransaction(teamId, async (tx) => {
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

      return { account };
    });

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

    const response = await whatsapp.templates.createTemplate(body);

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ errors: error.flatten() }), {
        status: 400,
      });
    }

    // 5. Log & return generic 500
    console.error("POST /api/posts error:", error);
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}
