import { getConversations } from "@/features/conversations/get-conversations";

export async function GET() {
  const result = await getConversations();
  return new Response(JSON.stringify(result), { status: 200 });
}
