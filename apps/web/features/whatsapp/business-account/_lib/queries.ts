import { getUserWithTeam } from "@/lib/db/queries";
import { unstable_cache } from "@/lib/unstable-cache";
import {
  WhatsAppBusinessAccountDetails,
  whatsAppBusinessAccountsTable,
  withTenantTransaction,
} from "@workspace/db";
import { eq } from "drizzle-orm";

export async function getWhatsAppBusinessAccountDetails() {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return null;
  }

  const { teamId } = userWithTeam;

  return await unstable_cache(
    async () => {
      try {
        const data = await withTenantTransaction(teamId, async (tx) => {
          const data = await tx.query.whatsAppBusinessAccountsTable.findFirst({
            where: eq(whatsAppBusinessAccountsTable.teamId, teamId),
            with: {
              team: {
                with: {
                  waBusinessPhoneNumber: true,
                },
              },
            },
          });

          return data;
        });

        return data;
      } catch (error) {
        return null;
      }
    },
    [`whatsapp:business-account:${teamId}`],
    {
      tags: [`whatsapp:business-account:${teamId}`],
    }
  )();
}
