import { getUserWithTeam } from "@/lib/db/queries";
import { conversationsTable, conversationMembersTable } from "@workspace/db";
import { withTenantTransaction } from "@workspace/db/tenant";
import { eq, and, count, lt, gt, ne, desc, asc } from "drizzle-orm";
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
    const limitPrev = parseInt(searchParams.get("limit") ?? "0", 10);
    const messageId = searchParams.get("messageId");
    const limit = 10;

    // 2. Compute counts
    let beforeCount: number;
    let afterCount: number;

    if (limit % 2 === 1) {
      // odd
      beforeCount = Math.floor((limit - 1) / 2);
      afterCount = beforeCount;
    } else {
      // even
      beforeCount = limit / 2 - 1;
      afterCount = limit / 2;
    }

    const { batch, total, beforeTotal, afterTotal } =
      await withTenantTransaction(teamId, async (tx) => {
        const batch: any[] = [];
        let beforeTotal = 0;
        let afterTotal = 0;

        if (messageId) {
          const target = await tx.query.conversationsTable.findFirst({
            where: and(
              eq(conversationsTable.contactId, id),
              eq(conversationsTable.id, messageId)
            ),
            with: {
              user: true,
            },
          });

          const beforeRecord = await tx.query.conversationsTable.findMany({
            where: and(
              eq(conversationsTable.contactId, id),
              gt(conversationsTable.createdAt, target!.createdAt),
              ne(conversationsTable.id, target!.id)
            ),
            orderBy: (conversationsTable, { asc }) => [
              asc(conversationsTable.createdAt),
            ],
            limit: beforeCount,
            with: {
              user: true,
            },
          });

          beforeTotal = await tx
            .select({
              count: count(),
            })
            .from(conversationsTable)
            .where(
              and(
                eq(conversationsTable.contactId, id),
                gt(conversationsTable.createdAt, target!.createdAt),
                ne(conversationsTable.id, target!.id)
              )
            )
            .execute()
            .then((res) => res[0]?.count ?? 0);

          const afterRecord = await tx.query.conversationsTable.findMany({
            where: and(
              eq(conversationsTable.contactId, id),
              lt(conversationsTable.createdAt, target!.createdAt),
              ne(conversationsTable.id, target!.id)
            ),
            orderBy: (conversationsTable, { desc }) => [
              desc(conversationsTable.createdAt),
            ],
            limit: afterCount + 1,
            with: {
              user: true,
            },
          });

          afterTotal = await tx
            .select({
              count: count(),
            })
            .from(conversationsTable)
            .where(
              and(
                eq(conversationsTable.contactId, id),
                lt(conversationsTable.createdAt, target!.createdAt),
                ne(conversationsTable.id, target!.id)
              )
            )
            .execute()
            .then((res) => res[0]?.count ?? 0);

          batch.push(...beforeRecord.reverse(), target, ...afterRecord);
        } else {
          const data = await tx.query.conversationsTable.findMany({
            where: eq(conversationsTable.contactId, id),
            orderBy: (conversationsTable, { desc }) => [
              desc(conversationsTable.createdAt),
            ],
            offset,
            limit: limitPrev > 0 ? limitPrev : limit + 1,
            with: {
              user: true,
            },
          });

          batch.push(...data);
        }

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

        return { batch, total, beforeTotal, afterTotal };
      });

    const hasNext = batch.length > limit;

    const data = hasNext ? batch.slice(0, limit) : batch;

    const previousOffset =
      beforeTotal > 0
        ? Math.max(0, beforeTotal - limit - beforeCount)
        : offset > 0
          ? Math.max(0, offset - limit)
          : null;

    const nextOffset = hasNext ? offset + limit : null;

    console.log({
      previousOffset,
      nextOffset,
    });
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
