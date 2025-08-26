import { z } from "zod";

import { withLogging } from "@/lib/http-logger";
import { getPresignedPost } from "@/lib/s3/get-pre-signed-port";

const BodySchema = z.object({
  contentType: z.string().min(1),
  filename: z.string().min(1),
});

async function postHandler(req: Request) {
  const body = BodySchema.parse(await req.json());
  const { fields, url } = await getPresignedPost(body);

  return new Response(JSON.stringify({ fields, url }), { status: 200 });
}

const logged = withLogging({ POST: postHandler });
// Important: export the wrapped handlers

export const POST = logged.POST!;
