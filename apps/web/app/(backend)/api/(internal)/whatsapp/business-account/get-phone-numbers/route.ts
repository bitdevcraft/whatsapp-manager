import {
  NewWhatsAppBusinessAccountPhoneNumber,
  whatsAppBusinessAccountPhoneNumbersTable,
  whatsAppBusinessAccountsTable,
  withTenantTransaction,
} from "@workspace/db";
import { buildConflictUpdateColumns } from "@workspace/db/lib";
import WhatsApp, { PhoneNumberResponse } from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

import { RESPONSE_CODE } from "@/lib/constants/response-code";
import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import { logger } from "@/lib/logger";

export async function GET() {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    logger.log("No Team ID");

    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  const { teamId } = userWithTeam;

  const data = await withTenantTransaction(teamId, async (tx) => {
    const data = await tx.query.whatsAppBusinessAccountsTable.findFirst({
      where: eq(whatsAppBusinessAccountsTable.teamId, teamId),
    });

    return data;
  });

  if (!data || !data?.accessToken) {
    return new Response("", {
      status: RESPONSE_CODE.NOT_FOUND,
      statusText: "No Business Account",
    });
  }

  const decryptedToken = await decryptApiKey({
    data: data.accessToken.data,
    iv: data.accessToken?.iv,
  });

  const config = {
    accessToken: decryptedToken,
    businessAcctId: String(data.id),
  };

  const whatsapp = new WhatsApp(config);

  try {
    const phoneNumbers = await whatsapp.phoneNumber.getPhoneNumbers();

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

    await withTenantTransaction(userWithTeam.teamId, async (tx) => {
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
    });

    revalidateTag(`phone-number:${teamId}`);
    return new Response(JSON.stringify(""), { status: 200 });
  } catch (error) {
    logger.error(error);
    return new Response(JSON.stringify(""), { status: 400 });
  }
}
