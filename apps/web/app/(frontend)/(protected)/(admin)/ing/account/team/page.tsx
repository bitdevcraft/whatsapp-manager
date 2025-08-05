import { auth } from "@workspace/auth";
import { headers as nextHeaders } from "next/headers";
import { TeamInvitation } from "./invitation";
import { TeamList } from "./team-list";
import { getMember } from "./_lib/queries";

export default async function Page() {
  const headers = await nextHeaders();

  const data = await auth.api.hasPermission({
    headers,
    body: {
      permissions: {
        invitation: ["create"], // This must match the structure in your access control
      },
    },
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
