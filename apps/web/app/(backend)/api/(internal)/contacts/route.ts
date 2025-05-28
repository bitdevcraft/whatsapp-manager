import { getContacts } from "@/features/contacts/get-users";

export async function GET() {
  const result = await getContacts();
  return new Response(JSON.stringify(result), { status: 200 });
}
