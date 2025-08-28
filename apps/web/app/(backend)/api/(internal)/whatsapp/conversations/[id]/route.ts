/* eslint-disable @typescript-eslint/no-explicit-any */
import { conversationMembersTable, conversationsTable } from "@workspace/db";
import { withTenantTransaction } from "@workspace/db/tenant";
import { and, count, eq, gt, isNull, lt, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

import { getUserWithTeam } from "@/lib/db/queries";

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

    const { batch, beforeTotal } = await withTenantTransaction(
      teamId,
      async (tx) => {
        const batch: any[] = [];
        let beforeTotal = 0;
        let afterTotal = 0;

        if (messageId) {
          const target = await tx.query.conversationsTable.findFirst({
            where: and(
              eq(conversationsTable.contactId, id),
              eq(conversationsTable.id, messageId),
              isNull(conversationsTable.deletedAt)
            ),
            with: {
              user: true,
            },
          });

          const beforeRecord = await tx.query.conversationsTable.findMany({
            limit: beforeCount,
            orderBy: (conversationsTable, { asc }) => [
              asc(conversationsTable.createdAt),
            ],
            where: and(
              eq(conversationsTable.contactId, id),
              gt(conversationsTable.createdAt, target!.createdAt),
              ne(conversationsTable.id, target!.id),
              isNull(conversationsTable.deletedAt)
            ),
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
                ne(conversationsTable.id, target!.id),
                isNull(conversationsTable.deletedAt)
              )
            )
            .execute()
            .then((res) => res[0]?.count ?? 0);

          const afterRecord = await tx.query.conversationsTable.findMany({
            limit: afterCount + 1,
            orderBy: (conversationsTable, { desc }) => [
              desc(conversationsTable.createdAt),
            ],
            where: and(
              eq(conversationsTable.contactId, id),
              lt(conversationsTable.createdAt, target!.createdAt),
              ne(conversationsTable.id, target!.id),
              isNull(conversationsTable.deletedAt)
            ),
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
                ne(conversationsTable.id, target!.id),
                isNull(conversationsTable.deletedAt)
              )
            )
            .execute()
            .then((res) => res[0]?.count ?? 0);

          batch.push(...beforeRecord.reverse(), target, ...afterRecord);
        } else {
          const data = await tx.query.conversationsTable.findMany({
            limit: limitPrev > 0 ? limitPrev : limit + 1,
            offset,
            orderBy: (conversationsTable, { desc }) => [
              desc(conversationsTable.createdAt),
            ],
            where: and(
              eq(conversationsTable.contactId, id),
              isNull(conversationsTable.deletedAt)
            ),
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
          .where(
            and(
              eq(conversationsTable.contactId, id),
              isNull(conversationsTable.deletedAt)
            )
          )
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

        return { afterTotal, batch, beforeTotal, total };
      }
    );

    const hasNext = batch.length > limit;

    const data = hasNext ? batch.slice(0, limit) : batch;

    const previousOffset =
      beforeTotal > 0
        ? Math.max(0, beforeTotal - limit - beforeCount)
        : offset > 0
          ? Math.max(0, offset - limit)
          : null;

    const nextOffset = hasNext ? offset + limit : null;

    return NextResponse.json(
      {
        data,
        nextOffset,
        previousOffset,
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
