import { getUserWithTeam } from "@/lib/db/queries";
import { conversationsTable, conversationMembersTable } from "@workspace/db";
import { withTenantTransaction } from "@workspace/db/tenant";
import { eq, and, count } from "drizzle-orm";
import user from "facebook-nodejs-business-sdk/src/objects/user";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const userWithTeam = await getUserWithTeam();

    if (!userWithTeam?.teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, user } = userWithTeam;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const limit = 10;

    const { batch, total } = await withTenantTransaction(teamId, async (tx) => {
      const batch = await tx.query.conversationsTable.findMany({
        where: eq(conversationsTable.contactId, id),
        orderBy: (conversationsTable, { desc }) => [
          desc(conversationsTable.createdAt),
        ],
        offset,
        limit: limit + 1,
        with: {
          user: true,
        },
      });

      const total = await tx
        .select({
          count: count(),
        })
        .from(conversationsTable)
        .where(eq(conversationsTable.contactId, id))
        .execute()
        .then((res) => res[0]?.count ?? 0);

      await tx
        .update(conversationMembersTable)
        .set({ lastReadAt: new Date() })
        .where(
          and(
            eq(conversationMembersTable.contactId, id),
            eq(conversationMembersTable.userId, user.id)
          )
        );

      return { batch, total };
    });

  
    const hasNext = batch.length > limit;

    const data = hasNext ? batch.slice(0, limit) : batch;

    const previousOffset = offset > 0 ? Math.max(0, offset - limit) : null;

    const nextOffset = hasNext ? offset + limit : null;

    return NextResponse.json(
      {
        data,
        previousOffset,
        nextOffset,
      },
      { status: 200 }
    );
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
}
