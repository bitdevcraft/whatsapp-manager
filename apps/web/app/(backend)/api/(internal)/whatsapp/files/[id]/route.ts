import {
  whatsAppBusinessAccountsTable,
  withTenantTransaction,
} from "@workspace/db";
import WhatsApp from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { RESPONSE_CODE } from "@/lib/constants/response-code";
import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  const { teamId } = userWithTeam;

  const { id } = await params;

  const formData = await request.formData();

  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { error: "No files received." },
      { status: RESPONSE_CODE.BAD_REQUEST }
    );
  }

  const data = await withTenantTransaction(teamId, async (tx) => {
    const data = await tx.query.whatsAppBusinessAccountsTable.findFirst({
      where: eq(whatsAppBusinessAccountsTable.teamId, teamId),
      with: {
        team: {
          with: {
            waBusinessPhoneNumber: true,
          },
        },
      },
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
    phoneNumberId: Number(id),
  };

  const whatsapp = new WhatsApp(config);

  const response = await whatsapp.media.uploadMedia(file);

  if (response.id) {
    return new Response(JSON.stringify(response), { status: 200 });
  }

  return new Response(JSON.stringify(response), { status: 400 });
}
