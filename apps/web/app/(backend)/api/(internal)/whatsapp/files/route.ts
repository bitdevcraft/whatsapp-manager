import { RESPONSE_CODE } from "@/lib/constants/response-code";
import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import {
  whatsAppBusinessAccountsTable,
  withTenantTransaction,
} from "@workspace/db";
import WhatsApp from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(request: Request) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  const { teamId } = userWithTeam;

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
      with: {
        team: {
          with: {
            waBusinessPhoneNumber: true,
          },
        },
      },
      where: eq(whatsAppBusinessAccountsTable.teamId, teamId),
    });

    return data;
  });

  if (!data || !data?.accessToken || !data.team.waBusinessPhoneNumber[0]) {
    return new Response("", {
      status: RESPONSE_CODE.NOT_FOUND,
      statusText: "No Business Account",
    });
  }

  const decryptedToken = await decryptApiKey({
    iv: data.accessToken?.iv,
    data: data.accessToken.data,
  });

  // const config = {
  //   accessToken: decryptedToken,
  //   phoneNumberId: Number(data.team.waBusinessPhoneNumber[0].id),
  //   businessAcctId: String(data.id),
  // };

  // const whatsapp = new WhatsApp(config);

  const APP_ID = process.env.META_APP_ID;
  const FB_API = "https://graph.facebook.com/v23.0";

  const fileName = file.name || "upload.bin";
  const fileType = file.type || "application/octet-stream";
  const fileLength = file.size.toString();

  // 1) INIT upload session: /{app_id}/uploads
  const initUrl = new URL(`${FB_API}/${APP_ID}/uploads`);
  initUrl.searchParams.set("file_name", fileName);
  initUrl.searchParams.set("file_length", fileLength);
  initUrl.searchParams.set("file_type", fileType);
  initUrl.searchParams.set("access_token", decryptedToken);

  const initRes = await fetch(initUrl.toString(), { method: "POST" });
  if (!initRes.ok) {
    const err = await initRes.text();
    return NextResponse.json(
      { step: "init", error: err },
      { status: initRes.status }
    );
  }
  const initData = await initRes.json(); // { id: "upload:<UPLOAD_SESSION_ID>" }
  const uploadId: string = initData.id;

  // 2) UPLOAD bytes to /v23.0/upload:<UPLOAD_SESSION_ID>
  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadUrl = `${FB_API}/${uploadId}`;

  const upRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `OAuth ${decryptedToken}`,
      file_offset: "0",
      // Content-Type not required for raw binary; Graph accepts octet-stream
      "Content-Type": "application/octet-stream",
    },
    body: bytes,
  });

  const text = await upRes.text();

  if (!upRes.ok) {
    return NextResponse.json(
      { step: "upload", error: text },
      { status: upRes.status }
    );
  }

  // Typically returns JSON with a handle key, often `h`
  // Example: { "h": "4::aW..." }
  let result: any;
  try {
    result = JSON.parse(text);
  } catch {
    result = { raw: text };
  }

  return new Response(JSON.stringify(result), { status: 200 });
}
