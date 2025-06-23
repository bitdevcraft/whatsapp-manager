import { RESPONSE_CODE } from "@/lib/constants/response-code";
import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import {
  whatsAppBusinessAccountPhoneNumbersTable,
  whatsAppBusinessAccountsTable,
} from "@workspace/db";
import { withTenantTransaction } from "@workspace/db/index";
import WhatsApp from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    logger.log("No Team ID");

    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  const { pin, phoneNumberId } = (await request.json()) as {
    pin: string;
    phoneNumberId: string;
  };

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
    iv: data.accessToken?.iv,
    data: data.accessToken.data,
  });

  const config = {
    accessToken: decryptedToken,
    phoneNumberId: Number(phoneNumberId),
    businessAcctId: String(data.id),
  };

  const whatsapp = new WhatsApp(config);

  const response =
    await whatsapp.twoStepVerification.setTwoStepVerificationCode(pin);

  if (response.success) {
    await withTenantTransaction(teamId, async (tx) => {
      await tx
        .update(whatsAppBusinessAccountPhoneNumbersTable)
        .set({
          isPinEnabled: true,
        })
        .where(
          eq(whatsAppBusinessAccountPhoneNumbersTable.id, Number(phoneNumberId))
        );
      return new Response(JSON.stringify(response), { status: 200 });
    });
  }
  return new Response(JSON.stringify(response), { status: 400 });
}
