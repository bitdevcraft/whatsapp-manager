/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { fileTypeFromBuffer } from "file-type";

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

  const config = {
    accessToken: decryptedToken,
    phoneNumberId: Number(data.team.waBusinessPhoneNumber[0].id),
    businessAcctId: String(data.id),
  };

  const whatsapp = new WhatsApp(config);

  const fileName = file.name || "upload.bin";
  const fileType = file.type || "application/octet-stream";
  const fileLength = file.size.toString();
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const uploadSession = await whatsapp.fileUpload.startSession({
      file_name: fileName,
      file_length: fileLength,
      file_type: fileType,
    });

    const startResumeResponse = await whatsapp.fileUpload.startResumeUpload({
      upload_session_id: uploadSession.id,
      body: bytes,
    });

    return new Response(JSON.stringify(startResumeResponse), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ errors: error.flatten() }), {
        status: 400,
      });
    }

    // 5. Log & return generic 500
    console.error("POST /api/posts error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    const userWithTeam = await getUserWithTeam();

    if (!userWithTeam?.teamId) {
      return new Response("", {
        status: 400,
        statusText: "No Team",
      });
    }

    const { teamId } = userWithTeam;

    const { searchParams } = new URL(request.url);

    const mediaId = String(searchParams.get("mediaId") ?? "");

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

    const config = {
      accessToken: decryptedToken,
      phoneNumberId: Number(data.team.waBusinessPhoneNumber[0].id),
      businessAcctId: String(data.id),
    };

    const whatsapp = new WhatsApp(config);

    const result = await whatsapp.media.getMediaById(mediaId);

    const fileBlog = await fetch(result.url, {
      method: "GET",
      headers: { Authorization: `OAuth ${decryptedToken}` },
    });

    if (!fileBlog.ok) {
      const err = await fileBlog.text();
      return NextResponse.json(
        { step: "init", error: err },
        { status: fileBlog.status }
      );
    }

    const bytes = await fileBlog.arrayBuffer();

    const ft = await fileTypeFromBuffer(bytes); // { mime, ext } | undefined

    const mime = ft?.mime ?? "application/octet-stream";
    const filename = `file.${ft?.ext ?? "bin"}`;

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ errors: error.flatten() }), {
        status: 400,
      });
    }

    // 5. Log & return generic 500
    console.error("POST /api/posts error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
