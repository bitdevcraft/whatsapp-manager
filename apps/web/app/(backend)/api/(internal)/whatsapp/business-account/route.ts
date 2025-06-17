import { encryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import {
  WhatsAppBusinessAccountAccessToken,
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
} from "@workspace/shared";
import WhatsApp from "@workspace/wa-cloud-api";
import axios from "axios";

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
      }
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
      response.data.access_token
    );

    const accessToken: WhatsAppBusinessAccountAccessToken = {
      ...encryptedAccessToken,
    };

    await withTenantTransaction(userWithTeam.teamId, async (tx) => {
      const newAccount: NewWhatsAppBusinessAccount = {
        id: Number(business.waba_id),
        teamId: userWithTeam.teamId!,
        ownerBusinessId: account.owner_business_info?.id,
        ownerBusinessName: account.owner_business_info?.name,
        accessToken,
        authResponse,
      };

      await tx
        .insert(whatsAppBusinessAccountsTable)
        .values(newAccount)
        .onConflictDoUpdate({
          target: whatsAppBusinessAccountsTable.wabaId,
          set: {
            ...newAccount,
          },
        });
    });
  } catch (error: any) {
    return new Response("", {
      status: 400,
      statusText: error.message,
    });
  }
}
