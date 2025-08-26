import {
  NewTemplate,
  NewWhatsAppBusinessAccountPhoneNumber,
  templatesTable,
  WhatsAppBusinessAccountAccessToken,
  whatsAppBusinessAccountPhoneNumbersTable,
  whatsAppBusinessAccountsTable,
  WhatsAppBusinessAuthAccountResponse,
} from "@workspace/db";
import {
  NewWhatsAppBusinessAccount,
  withTenantTransaction,
} from "@workspace/db/index";
import { buildConflictUpdateColumns } from "@workspace/db/lib";
import WhatsApp, {
  PhoneNumberResponse,
  TemplateResponse,
} from "@workspace/wa-cloud-api";
import axios from "axios";
import { eq } from "drizzle-orm";

import { env } from "@/env/server";
import { encryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import {
  EmbeddedSignUpAuthorizedObject,
  EmbedSignUpExchangeToken,
  EmbedSignupSuccessObject,
} from "@/types/embedded-signup";

export async function GET() {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam) {
    logger.log("No team");

    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  if (!userWithTeam.teamId) {
    logger.log("No Team ID");

    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  const data = await withTenantTransaction(userWithTeam.teamId, async (tx) => {
    return await tx.query.whatsAppBusinessAccountsTable.findFirst({
      where: eq(whatsAppBusinessAccountsTable.teamId, userWithTeam.teamId!),
    });
  });

  if (!data) return Response.json({ id: null, teamId: userWithTeam.teamId });

  return Response.json({ id: data?.id, teamId: userWithTeam.teamId });
}

export async function POST(request: Request) {
  logger.log("New Account");

  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam) {
    logger.log("No team");

    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  if (!userWithTeam.teamId) {
    logger.log("No Team ID");

    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  try {
    const body = (await request.json()) as EmbeddedSignUpAuthorizedObject;

    const business = body.signUp.data as EmbedSignupSuccessObject;
    const code = body.auth.authResponse.code;

    const url = "https://graph.facebook.com/v22.0/oauth/access_token";

    const response = await axios.post<EmbedSignUpExchangeToken>(
      url,
      {
        client_id: env.M4D_APP_ID,
        client_secret: env.META_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const config = {
      accessToken: response.data.access_token,
      businessAcctId: business.waba_id,
      phoneNumberId: Number(business.phone_number_id),
    };

    const whatsapp = new WhatsApp(config);

    const account = await whatsapp.waba.getWabaAccount([
      "id",
      "name",
      "owner_business_info",
    ]);

    // TODO
    const phoneNumbers = await whatsapp.phoneNumber.getPhoneNumbers();
    logger.log(phoneNumbers);

    // TODO
    const templates = await whatsapp.templates.getTemplates();
    logger.log(templates);

    const encryptedAuth = await encryptApiKey(code);
    logger.log(encryptedAuth);

    const authResponse: WhatsAppBusinessAuthAccountResponse = {
      ...encryptedAuth,
    };

    const encryptedAccessToken = await encryptApiKey(
      response.data.access_token
    );
    logger.log(encryptedAccessToken);

    const accessToken: WhatsAppBusinessAccountAccessToken = {
      ...encryptedAccessToken,
    };

    const newAccount: NewWhatsAppBusinessAccount = {
      accessToken,
      authResponse,
      id: Number(business.waba_id),
      ownerBusinessId: account.owner_business_info?.id,
      ownerBusinessName: account.owner_business_info?.name,
      teamId: userWithTeam.teamId!,
    };

    const newTemplates: NewTemplate[] = templates.data.map(
      (template: TemplateResponse) => {
        const temp: NewTemplate = {
          content: template,
          id: template.id,
          name: template.name,
          teamId: userWithTeam.teamId!,
        };
        return temp;
      }
    );

    const newPhoneNumbers: NewWhatsAppBusinessAccountPhoneNumber[] =
      phoneNumbers.data.map((phoneNumber: PhoneNumberResponse) => {
        const temp: NewWhatsAppBusinessAccountPhoneNumber = {
          accountMode: phoneNumber.account_mode,
          certificate: phoneNumber.certificate,
          codeVerificationStatus: phoneNumber.code_verification_status,
          conversationalAutomation: phoneNumber.conversational_automation,
          displayPhoneNumber: phoneNumber.display_phone_number,
          healthStatus: phoneNumber.health_status,
          id: Number(phoneNumber.id),
          isOfficialBusinessAccount: phoneNumber.is_official_business_account,
          isOnBizApp: phoneNumber.is_on_biz_app,
          isPinEnabled: phoneNumber.is_pin_enabled,
          isPreverifiedNumber: phoneNumber.is_preverified_number,
          lastOnboardTime: phoneNumber.last_onboarded_time,
          messagingLimitTier: phoneNumber.messaging_limit_tier,
          nameStatus: phoneNumber.name_status,
          newCertificate: phoneNumber.new_certificate,
          newNameStatus: phoneNumber.new_name_status,
          platformType: phoneNumber.platform_type,
          qualityRating: phoneNumber.quality_rating,
          qualityScore: phoneNumber.quality_score,
          searchVisibility: phoneNumber.search_visibility,
          status: phoneNumber.status,
          teamId: userWithTeam.teamId!,
          throughput: phoneNumber.throughput,
          verifiedName: phoneNumber.verified_name,
        };
        return temp;
      });

    const temp = await withTenantTransaction(
      userWithTeam.teamId,
      async (tx) => {
        const accountData = await tx
          .insert(whatsAppBusinessAccountsTable)
          .values(newAccount)
          .onConflictDoUpdate({
            set: {
              ...newAccount,
            },
            target: whatsAppBusinessAccountsTable.wabaId,
          });

        if (newTemplates.length > 0)
          await tx
            .insert(templatesTable)
            .values(newTemplates)
            .onConflictDoUpdate({
              set: buildConflictUpdateColumns(templatesTable, [
                "updatedAt",
                "name",
                "content",
              ]),
              target: templatesTable.id,
            });

        if (newPhoneNumbers.length > 0)
          await tx
            .insert(whatsAppBusinessAccountPhoneNumbersTable)
            .values(newPhoneNumbers)
            .onConflictDoUpdate({
              set: buildConflictUpdateColumns(
                whatsAppBusinessAccountPhoneNumbersTable,
                [
                  "displayPhoneNumber",
                  "verifiedName",
                  "status",
                  "qualityScore",
                  "qualityRating",
                  "codeVerificationStatus",
                  "healthStatus",
                  "isOfficialBusinessAccount",
                  "isOnBizApp",
                  "isPinEnabled",
                  "isPreverifiedNumber",
                  "lastOnboardTime",
                  "messagingLimitTier",
                  "nameStatus",
                  "newCertificate",
                  "newNameStatus",
                ]
              ),
              target: whatsAppBusinessAccountPhoneNumbersTable.id,
            });

        return {
          accountData,
        };
      }
    );

    logger.log(temp);

    return new Response("", {
      status: 200,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response("", {
      status: 400,
      statusText: error.message,
    });
  }
}
