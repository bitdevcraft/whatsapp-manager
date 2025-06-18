import { encryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
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
import {
  EmbeddedSignUpAuthorizedObject,
  EmbedSignUpExchangeToken,
  EmbedSignupSuccessObject,
} from "@/types/embedded-signup";
import WhatsApp, {
  PhoneNumberResponse,
  TemplateResponse,
} from "@workspace/wa-cloud-api";
import axios from "axios";
import { buildConflictUpdateColumns } from "@workspace/db/lib";

export async function POST(request: Request) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam) {
    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  if (!userWithTeam.teamId) {
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
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: "https://wa-ing.centcapio.cc/",
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    const config = {
      accessToken: response.data.access_token,
      phoneNumberId: Number(business.phone_number_id),
      businessAcctId: business.waba_id,
    };

    const whatsapp = new WhatsApp(config);

    const account = await whatsapp.waba.getWabaAccount([
      "id",
      "name",
      "account_review_status",
      "auth_international_rate_eligibility",
      "business_verification_status",
      "country",
      "currency",
      "health_status",
      "status",
      "ownership_type",
      "timezone_id",
      "owner_business_info",
      "primary_funding_id",
      "message_template_namespace",
    ]);

    // TODO
    const phoneNumbers = await whatsapp.phoneNumber.getPhoneNumbers();

    // TODO
    const templates = await whatsapp.templates.getTemplates();

    const encryptedAuth = await encryptApiKey(code);

    const authResponse: WhatsAppBusinessAuthAccountResponse = {
      ...encryptedAuth,
    };

    const encryptedAccessToken = await encryptApiKey(
      response.data.access_token,
    );

    const accessToken: WhatsAppBusinessAccountAccessToken = {
      ...encryptedAccessToken,
    };

    const newAccount: NewWhatsAppBusinessAccount = {
      id: Number(business.waba_id),
      teamId: userWithTeam.teamId!,
      ownerBusinessId: account.owner_business_info?.id,
      ownerBusinessName: account.owner_business_info?.name,
      accessToken,
      authResponse,
    };

    const newTemplates: NewTemplate[] = templates.data.map(
      (template: TemplateResponse) => {
        const temp: NewTemplate = {
          id: template.id,
          name: template.name,
          teamId: userWithTeam.teamId!,
          content: template,
        };
        return temp;
      },
    );

    const newPhoneNumbers: NewWhatsAppBusinessAccountPhoneNumber[] =
      phoneNumbers.data.map((phoneNumber: PhoneNumberResponse) => {
        const temp: NewWhatsAppBusinessAccountPhoneNumber = {
          id: Number(phoneNumber.id),
          teamId: userWithTeam.teamId!,
          displayPhoneNumber: phoneNumber.display_phone_number,
          verifiedName: phoneNumber.verified_name,
          status: phoneNumber.status,
          qualityRating: phoneNumber.quality_rating,
          searchVisibility: phoneNumber.search_visibility,
          platformType: phoneNumber.platform_type,
          codeVerificationStatus: phoneNumber.code_verification_status,
          accountMode: phoneNumber.account_mode,
          certificate: phoneNumber.certificate,
          conversationalAutomation: phoneNumber.conversational_automation,
          healthStatus: phoneNumber.health_status,
          isOfficialBusinessAccount: phoneNumber.is_official_business_account,
          isOnBizApp: phoneNumber.is_on_biz_app,
          isPinEnabled: phoneNumber.is_pin_enabled,
          isPreverifiedNumber: phoneNumber.is_preverified_number,
          lastOnboardTime: phoneNumber.last_onboarded_time,
          messagingLimitTier: phoneNumber.messaging_limit_tier,
          nameStatus: phoneNumber.name_status,
          newCertificate: phoneNumber.new_certificate,
          newNameStatus: phoneNumber.new_name_status,
          qualityScore: phoneNumber.quality_score,
          throughput: phoneNumber.throughput,
        };
        return temp;
      });

    await withTenantTransaction(userWithTeam.teamId, async (tx) => {
      await tx
        .insert(whatsAppBusinessAccountsTable)
        .values(newAccount)
        .onConflictDoUpdate({
          target: whatsAppBusinessAccountsTable.wabaId,
          set: {
            ...newAccount,
          },
        });

      await tx
        .insert(templatesTable)
        .values(newTemplates)
        .onConflictDoUpdate({
          target: templatesTable.id,
          set: buildConflictUpdateColumns(templatesTable, [
            "updatedAt",
            "name",
            "content",
          ]),
        });

      await tx
        .insert(whatsAppBusinessAccountPhoneNumbersTable)
        .values(newPhoneNumbers)
        .onConflictDoUpdate({
          target: whatsAppBusinessAccountPhoneNumbersTable.id,
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
            ],
          ),
        });
    });

    return new Response("", {
      status: 200,
    });
  } catch (error: any) {
    return new Response("", {
      status: 400,
      statusText: error.message,
    });
  }
}
