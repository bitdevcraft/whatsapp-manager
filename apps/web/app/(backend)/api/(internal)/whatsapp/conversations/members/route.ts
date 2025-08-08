import { getUserWithTeam } from "@/lib/db/queries";
import { conversationMembersTable } from "@workspace/db";
import { withTenantTransaction } from "@workspace/db/tenant";
import { and, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  const { teamId, user } = userWithTeam;

  const body = (await request.json()) as {
    contactId: string;
    markAsRead: boolean;
  };

  try {
    await withTenantTransaction(teamId, async (tx) => {
      await tx
        .update(conversationMembersTable)
        .set({
          lastReadAt: new Date(),
        })
        .where(
          and(
            eq(conversationMembersTable.contactId, body.contactId),
            eq(conversationMembersTable.userId, user.id)
          )
        );
    });
  } catch (error) {
    return new Response("", {
      status: 400,
    });
  }

  return new Response("", {
    status: 200,
  });
}
