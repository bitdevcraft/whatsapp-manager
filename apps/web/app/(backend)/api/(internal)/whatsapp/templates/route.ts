import { getTemplates } from "@/features/templates/get-template";

export async function GET() {
  const result = await getTemplates();
  return new Response(JSON.stringify(result), { status: 200 });
}
