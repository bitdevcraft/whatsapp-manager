import { getUsers } from "@/features/users/get-users";

export async function GET() {
  const result = await getUsers();
  return new Response(JSON.stringify(result), { status: 200 });
}
