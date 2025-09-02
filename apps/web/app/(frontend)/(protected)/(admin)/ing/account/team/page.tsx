import { auth } from "@workspace/auth";
import { headers as nextHeaders } from "next/headers";

import { getMember } from "./_lib/queries";
import { TeamInvitation } from "./invitation";
import { TeamList } from "./team-list";

export default async function Page() {
  const headers = await nextHeaders();

  const data = await auth.api.hasPermission({
    body: {
      permissions: {
        invitation: ["create"], // This must match the structure in your access control
      },
    },
    headers,
  });

  if (data.error) return <div>Unauthorized</div>;

  const teamMembersPromise = Promise.all([getMember()]);

  return (
    <div className="space-y-4">
      <TeamInvitation canInvite={data.success} />
      <TeamList promises={teamMembersPromise} />
    </div>
  );
}
