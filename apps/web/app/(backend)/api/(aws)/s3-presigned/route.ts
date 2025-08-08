import { withLogging } from "@/lib/http-logger";
import { getPresignedPost } from "@/lib/s3/get-pre-signed-port";
import { z } from "zod";

const BodySchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

async function postHandler(req: Request) {
  const body = BodySchema.parse(await req.json());
  const { url, fields } = await getPresignedPost(body);

  return new Response(JSON.stringify({ url, fields }), { status: 200 });
}

const logged = withLogging({ POST: postHandler });
// Important: export the wrapped handlers

export const POST = logged.POST!;
