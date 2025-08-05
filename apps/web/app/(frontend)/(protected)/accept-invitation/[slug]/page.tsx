import { authClient } from "@/lib/auth/auth-client";
import { auth } from "@workspace/auth";
import { headers as nextHeaders } from "next/headers";
import InvitationExpired from "./invitation-expired";
import InvitationSuccess from "./invitation-success";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const headers = await nextHeaders();

  try {
    const data = await auth.api.acceptInvitation({
      body: {
        invitationId: slug, // required
      },
      headers,
    });
  } catch (error: any) {
    return <InvitationExpired />;
  }

  return <InvitationSuccess />;
}
