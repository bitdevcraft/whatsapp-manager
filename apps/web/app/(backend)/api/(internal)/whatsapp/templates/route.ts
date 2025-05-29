import { getTemplates } from "@/features/templates/get-template";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sync = searchParams.get("sync");

  const result = await getTemplates(!!sync);
  return new Response(JSON.stringify(result), { status: 200 });
}
