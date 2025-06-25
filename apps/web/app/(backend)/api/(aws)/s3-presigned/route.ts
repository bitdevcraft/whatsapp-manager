// apps/web/app/api/s3-presigned/route.ts
import { getPresignedPost } from "@/lib/s3/get-pre-signed-port";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = BodySchema.parse(await req.json());
  const { url, fields } = await getPresignedPost(body);

  return NextResponse.json({ url, fields });
}

// Opt-in to edge runtime if you like:
// export const runtime = 'edge';
