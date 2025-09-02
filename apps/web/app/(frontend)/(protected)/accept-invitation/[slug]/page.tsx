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
    await auth.api.acceptInvitation({
      body: {
        invitationId: slug, // required
      },
      headers,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return <InvitationExpired />;
  }

  return <InvitationSuccess />;
}
