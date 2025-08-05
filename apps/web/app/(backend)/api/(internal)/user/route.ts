import { getUser } from "@/server/get-session";

export async function GET() {
  const user = await getUser();
  return Response.json(user);
}
