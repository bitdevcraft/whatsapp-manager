import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import { contactsTable } from "@workspace/db";
import { MessageStatus } from "@workspace/db/enums";
import {
  conversationsTable,
  marketingCampaignsTable,
  NewContact,
  NewConversation,
  templatesTable,
  whatsAppBusinessAccountsTable,
} from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import WhatsApp, {
  ComponentTypesEnum,
  MessageTemplateObject,
  WhatsAppConfig,
} from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import z from "zod";
import { generateConversationComponentBody } from "../../../actions";
import { UsageLimitRepository } from "@workspace/db/repositories";
import { nanoid } from "nanoid";

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

    const body = (await request.json()) as { phone: string };

    const { teamId, user } = userWithTeam;

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

    const { account, template, contact } = await withTenantTransaction(
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

        let contact = await tx.query.contactsTable.findFirst({
          where: eq(
            contactsTable.normalizedPhone,
            body.phone.replace(/\D/g, "")
          ),
        });

        if (!contact) {
          const tempContact: NewContact = {
            email: "",
            name: "",
            teamId,
            message: "",
            phone: body.phone.replace(/\D/g, ""),
          };
          contact = (
            await tx.insert(contactsTable).values(tempContact).returning()
          )[0];
        }

        return { account, template, contact };
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

    const response =
      // { messages: [{ id: nanoid() }] };
      await whatsapp.messages.template({
        body: messageTemplate! as MessageTemplateObject<ComponentTypesEnum>,
        to: body.phone.replace(/\D/g, ""),
      });

    const isSuccess = !!response?.messages[0]?.id;

    const conversationBody = generateConversationComponentBody(
      messageTemplate as MessageTemplateObject<ComponentTypesEnum>,
      template
    );

    await withTenantTransaction(teamId, async (tx) => {
      const conv: NewConversation = {
        userId: user.id,
        teamId,
        contactId: contact?.id,
        content: {
          body: messageTemplate as MessageTemplateObject<ComponentTypesEnum>,
          to: body.phone.replace(/\D/g, ""),
        },
        from: null,
        wamid: response?.messages[0]?.id,
        status: isSuccess ? MessageStatus.DELIVERED : null,
        isMarketingCampaign: true,
        success: isSuccess,
        body: conversationBody,
        direction: "outbound",
      };
      await tx.insert(conversationsTable).values(conv);
    });

    const usageRepo = new UsageLimitRepository(teamId);
    await usageRepo.upsertUsageTracking(user.id, 1);

    return NextResponse.json({}, { status: 200 });
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
