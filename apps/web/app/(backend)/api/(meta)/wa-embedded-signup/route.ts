import { env } from "@/env/server";

interface BodyProps {
  code: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as BodyProps;

  const url = "https://graph.facebook.com/v22.0/oauth/access_token";
  const response = await fetch(url, {
    body: JSON.stringify({
      client_id: env.M4D_APP_ID,
      client_secret: env.META_CLIENT_SECRET,
      code: body.code,
      grant_type: "authorization_code",
      redirect_uri: env.BASE_URL,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  await response.json();
  return new Response("", { status: 200 });
}
