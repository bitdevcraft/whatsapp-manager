import {
  conversationsTable,
  MessageStatus,
  templatesTable,
  withTenantTransaction,
} from "@workspace/db";
import { UsageLimitRepository } from "@workspace/db/repositories";
import {
  NewConversation,
  whatsAppBusinessAccountsTable,
} from "@workspace/db/schema";
import WhatsApp, {
  ComponentTypesEnum,
  MessageTemplateObject,
  WhatsAppConfig,
} from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import { templateSendSchema } from "@/types/validations/templates/template-send-schema";

import { generateConversationComponentBody } from "../../actions";

export async function POST(request: NextRequest) {
  try {
    const userWithTeam = await getUserWithTeam();

    if (!userWithTeam?.teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, user } = userWithTeam;
    const body = await request.json();
    const input = templateSendSchema.parse(body);

    const { account, template } = await withTenantTransaction(
      teamId,
      async (tx) => {
        const account = await tx.query.whatsAppBusinessAccountsTable.findFirst({
          where: eq(whatsAppBusinessAccountsTable.teamId, teamId),
          with: {
            team: {
              with: {
                waBusinessPhoneNumber: true,
              },
            },
          },
        });

        const template = await tx.query.templatesTable.findFirst({
          where: eq(templatesTable.id, input.templateId),
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
      data,
      iv,
    });

    const config: WhatsAppConfig = {
      accessToken: decryptAccessToken,
      businessAcctId: String(account.id),
      phoneNumberId: account.team.waBusinessPhoneNumber[0].id,
    };

    const whatsapp = new WhatsApp(config);

    const response = await whatsapp.messages.template({
      body: input.template
        .messageTemplate! as MessageTemplateObject<ComponentTypesEnum>,
      to: input.phone.replace(/\D/g, ""),
    });

    const isSuccess = !!response?.messages[0]?.id;

    const conversationBody = generateConversationComponentBody(
      input.template
        .messageTemplate as MessageTemplateObject<ComponentTypesEnum>,
      template
    );

    await withTenantTransaction(teamId, async (tx) => {
      const conv: NewConversation = {
        body: conversationBody,
        contactId: input.contactId,
        content: {
          body: input.template
            .messageTemplate! as MessageTemplateObject<ComponentTypesEnum>,
          to: input.phone.replace(/\D/g, ""),
        },
        direction: "outbound",
        from: null,
        isMarketingCampaign: true,
        status: isSuccess ? MessageStatus.DELIVERED : null,
        success: isSuccess,
        teamId,
        templateId: input.templateId,
        userId: user.id,
        wamid: response?.messages[0]?.id,
      };
      await tx.insert(conversationsTable).values(conv);
    });

    const usageRepo = new UsageLimitRepository(teamId);

    if (isSuccess) await usageRepo.upsertUsageTracking(user.id, 1);

    return NextResponse.json({}, { status: 200 });
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
