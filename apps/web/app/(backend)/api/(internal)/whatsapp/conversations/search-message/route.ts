import { conversationsTable, withTenantTransaction } from "@workspace/db";
import { and, eq, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

import { getUserWithTeam } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const userWithTeam = await getUserWithTeam();

    if (!userWithTeam?.teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = userWithTeam;

    const { searchParams } = new URL(request.url);

    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const searchInput = String(searchParams.get("search") ?? "");
    const contactId = String(searchParams.get("contactId") ?? "");
    const limit = 10;

    if (!searchInput) {
      return NextResponse.json(
        {
          data: [],
          nextOffset: null,
          previousOffset: null,
        },
        { status: 200 }
      );
    }

    const { conversations } = await withTenantTransaction(
      teamId,
      async (tx) => {
        const conversations = await tx.query.conversationsTable.findMany({
          limit: limit + 1,
          offset,
          orderBy: (conversationsTable, { asc }) => [
            asc(conversationsTable.createdAt),
          ],
          where: and(
            or(sql`similarity (body::text, ${searchInput}::text) > 0.1`),
            eq(conversationsTable.contactId, contactId)
          ),
          with: {
            contact: {
              columns: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        });

        return {
          conversations,
        };
      }
    );

    const hasNext = conversations.length > limit;

    const data = hasNext ? conversations.slice(0, limit) : conversations;

    const previousOffset = offset > 0 ? Math.max(0, offset - limit) : null;

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
    console.error("POST /api/whatsapp/conversations/search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
