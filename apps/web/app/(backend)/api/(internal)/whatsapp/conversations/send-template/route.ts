import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import { templateSendSchema } from "@/types/validations/template-schema";
import {
  baseConversation,
  conversationsTable,
  MessageStatus,
  templatesTable,
  withTenantTransaction,
} from "@workspace/db";
import {
  Conversation,
  ConversationBody,
  NewConversation,
  whatsAppBusinessAccountsTable,
} from "@workspace/db/schema";
import WhatsApp, {
  ComponentTypesEnum,
  MessageTemplateObject,
  ParametersTypesEnum,
  WhatsAppConfig,
} from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

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
      iv,
      data,
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

    const conversationBody: ConversationBody = {};

    if (template?.content) {
      const { parameter_format, components } = template.content;

      components.forEach((component) => {
        switch (component.type) {
          case "HEADER":
            conversationBody.header = {
              text: component.text,
            };
            break;
          case "BODY":
            conversationBody.body = {
              text: component.text,
            };
            break;
          case "FOOTER":
            conversationBody.footer = component.text;
            break;
          case "BUTTONS":
            conversationBody.buttons = component.buttons.map((button) => {
              switch (button.type) {
                case "PHONE_NUMBER":
                case "URL":
                case "QUICK_REPLY":
                case "FLOW":
                  return {
                    type: button.type,
                    text: button.text,
                  };

                default:
                  return {
                    type: button.type,
                  };
              }
            });
            break;

          default:
            break;
        }
      });
    }

    const { components } = input.template
      .messageTemplate as MessageTemplateObject<ComponentTypesEnum>;

    components?.forEach((component) => {
      const { type, parameters } = component;

      if (type === ComponentTypesEnum.Header) {
        const baseConversation: baseConversation = {};
        const parameterName: Record<string, string> = {};
        const indexName: string[] = [];
        parameters.forEach((parameter) => {
          switch (parameter.type) {
            case ParametersTypesEnum.Text:
              if (parameter.parameter_name)
                parameterName[parameter.parameter_name] = parameter.text;
              else indexName.push(parameter.text);
              break;
            case ParametersTypesEnum.Image:
            case ParametersTypesEnum.Document:
            case ParametersTypesEnum.Video:
              baseConversation.media = {
                url: parameter.link,
                id: parameter.id,
                caption: parameter.caption,
              };

              break;
            default:
              break;
          }
        });

        conversationBody.header!.media = baseConversation.media;

        if (
          Object.keys(parameterName).length > 0 &&
          conversationBody.header?.text
        ) {
          conversationBody.header.text = interpolate(
            conversationBody.header.text,
            parameterName
          );
        }
        if (indexName.length > 0 && conversationBody.header?.text) {
          conversationBody.header.text = interpolate(
            conversationBody.header.text,
            indexName
          );
        }
      }

      if (type === ComponentTypesEnum.Body) {
        const parameterName: Record<string, string> = {};
        const indexName: string[] = [];
        parameters.forEach((parameter) => {
          switch (parameter.type) {
            case ParametersTypesEnum.Text:
              if (parameter.parameter_name)
                parameterName[parameter.parameter_name] = parameter.text;
              else indexName.push(parameter.text);
              break;

              break;
            default:
              break;
          }
        });

        if (
          Object.keys(parameterName).length > 0 &&
          conversationBody.body?.text
        ) {
          conversationBody.body.text = interpolate(
            conversationBody.body.text,
            parameterName
          );
        }
        if (indexName.length > 0 && conversationBody.body?.text) {
          conversationBody.body.text = interpolate(
            conversationBody.body.text,
            indexName
          );
        }
      }
    });

    await withTenantTransaction(teamId, async (tx) => {
      const conv: NewConversation = {
        userId: user.id,
        teamId,
        contactId: input.contactId,
        content: {
          body: input.template
            .messageTemplate! as MessageTemplateObject<ComponentTypesEnum>,
          to: input.phone.replace(/\D/g, ""),
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

function interpolate(
  template: string,
  record: Record<string, unknown> | unknown[]
): string {
  return template.replace(/{{\s*([^{}]+)\s*}}/g, (_match, rawToken) => {
    const token = String(rawToken).trim();

    if (Array.isArray(record) && /^\d+$/.test(token)) {
      // 1-based index in the placeholder → 0-based index in the array
      const value = record[Number(token) - 1];
      return value != null ? String(value) : "";
    }

    if (!Array.isArray(record) && token in record) {
      const value = (record as Record<string, unknown>)[token];
      return value != null ? String(value) : "";
    }

    // Unresolved tokens default to an empty string
    return "";
  });
}
