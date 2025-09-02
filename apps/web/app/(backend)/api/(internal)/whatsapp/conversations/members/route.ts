import { conversationMembersTable } from "@workspace/db";
import { withTenantTransaction } from "@workspace/db/tenant";
import { and, eq } from "drizzle-orm";

import { getUserWithTeam } from "@/lib/db/queries";
import z from "zod";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  const { teamId, user } = userWithTeam;

  const body = BodySchema.parse(await request.json());

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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.flatten() }, { status: 400 });
    }

    // 5. Log & return generic 500
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }

  return NextResponse.json("", { status: 200 });
}

const BodySchema = z.object({
  contactId: z.string().uuid(),
  markAsRead: z.boolean(),
});
