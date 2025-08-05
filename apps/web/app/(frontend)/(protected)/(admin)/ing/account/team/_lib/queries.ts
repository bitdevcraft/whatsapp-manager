import { getUserWithTeam } from "@/lib/db/queries";
import { unstable_cache } from "@/lib/unstable-cache";
import { TeamMemberDetail, teamMembersTable } from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import { eq } from "drizzle-orm";

export async function getMember() {
  const userWithTeam = await getUserWithTeam();

  const defaultValue: TeamMemberDetail[] = [];

  if (!userWithTeam?.teamId) {
    return defaultValue;
  }

  const { teamId } = userWithTeam;

  return await unstable_cache(
    async () => {
      try {
        const data = await withTenantTransaction(teamId, async (tx) => {
          return await tx.query.teamMembersTable.findMany({
            where: eq(teamMembersTable.organizationId, teamId),
            with: {
              user: true,
            },
          });
        });

        return data;
      } catch (error) {
        console.log(error);
        return defaultValue;
      }
    },
    [teamId],
    {
      tags: [`team-member:${teamId}`],
    }
  )();
}
