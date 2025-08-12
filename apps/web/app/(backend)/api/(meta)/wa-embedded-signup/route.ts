interface BodyProps {
  code: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as BodyProps;

  const url = "https://graph.facebook.com/v22.0/oauth/access_token";
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_CLIENT_SECRET,
      code: body.code,
      grant_type: "authorization_code",
      redirect_uri: process.env.NEXT_PUBLIC_WEB_URL,
    }),
    headers: { "Content-Type": "application/json" },
  });
  await response.json();
  return new Response("", { status: 200 });
}
