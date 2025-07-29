import { db, teamMembersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function getActiveOrganization(userId: string) {
  const data = await db.query.teamMembersTable.findFirst({
    where: eq(teamMembersTable.userId, userId),
    with: {
      team: true,
    },
  });

  return data?.team;
}
