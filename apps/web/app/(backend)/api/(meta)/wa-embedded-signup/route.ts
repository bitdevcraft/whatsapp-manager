import axios from "axios";

interface BodyProps {
  code: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as BodyProps;
  /*
  const url = "https://graph.facebook.com/v22.0/oauth/access_token";
  const data = {
    client_id: process.env.META_APP_ID,
    client_secret: process.env.META_CLIENT_SECRET,
    code: body.code,
    grant_type: "authorization_code",
  };

  console.log(data);

  try {
    const response = await axios.post(url, data);
    console.log(response.data);
  } catch (error) {
    console.error(error);
    return new Response("", { status: 500 });
  }
*/

  const url = "https://graph.facebook.com/v22.0/oauth/access_token";
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_CLIENT_SECRET,
      code: body.code,
      grant_type: "authorization_code",
      redirect_uri: "https://wa-ing.centcapio.cc/",
    }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  console.log(data);
  return new Response("", { status: 200 });
}
