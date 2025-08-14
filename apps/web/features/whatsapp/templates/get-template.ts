import { templatesTable } from "@workspace/db/schema/templates";
import { syncTemplate } from "./sync-template";
import { getUserWithTeam } from "@/lib/db/queries";
import { withTenantTransaction } from "@workspace/db/tenant";

export async function getTemplates(sync = false) {
  if (sync) {
    await syncTemplate();
  }

  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam) {
    return [];
  }

  if (!userWithTeam?.teamId) {
    return [];
  }

  return await withTenantTransaction(userWithTeam.teamId, async (tx) => {
    return await tx.select().from(templatesTable);
  });
}
