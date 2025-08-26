import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import {
  contactsTable,
  ConversationBody,
  conversationMembersTable,
  conversationsTable,
  NewConversation,
  whatsAppBusinessAccountsTable,
} from "@workspace/db";
import { UsageLimitRepository } from "@workspace/db/repositories";
import { withTenantTransaction } from "@workspace/db/tenant";
import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";
import { and, count, eq, gt, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(request: NextRequest) {
  try {
    const userWithTeam = await getUserWithTeam();

    if (!userWithTeam?.teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = userWithTeam;

    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const unread = Boolean(searchParams.get("unread") ?? false);
    const limit = 10;

    const { batch } = await withTenantTransaction(teamId, async (tx) => {
      const messages = tx
        .select({
          // ...getTableColumns(conversationsTable),
          id: contactsTable.id,
          message: conversationsTable.body,
          createdAt: conversationsTable.createdAt,
          contact: {
            name: contactsTable.name,
            phone: contactsTable.phone,
          },
          isUnread: sql<boolean>`
                      (${conversationsTable.createdAt} > ${conversationMembersTable.lastReadAt})
                    `.as("isUnread"),
          rn: sql<number>`row_number() over (
                      partition by ${conversationsTable.contactId}
                      order by ${conversationsTable.createdAt} desc
                    )`.as("rn"),
        })
        .from(conversationsTable)
        .innerJoin(
          conversationMembersTable,
          and(
            eq(
              conversationMembersTable.contactId,
              conversationsTable.contactId
            ),
            // eq(conversationMembersTable.userId, user.id),
            unread
              ? gt(
                  conversationsTable.createdAt,
                  conversationMembersTable.lastReadAt
                )
              : undefined
          )
        )
        .leftJoin(
          contactsTable,
          eq(contactsTable.id, conversationsTable.contactId)
        )
        .as("sub");

      const batch = await tx
        .select()
        .from(messages)
        .where(eq(sql<number>`"sub"."rn"`, 1))
        .limit(limit + 1)
        .offset(offset);

      const total = await tx
        .select({
          count: count(),
        })
        .from(messages)
        .where(eq(sql<number>`"sub"."rn"`, 1))
        .execute()
        .then((res) => res[0]?.count ?? 0);

      return {
        batch,
        total,
      };
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

export async function POST(request: Request) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  const { teamId, user } = userWithTeam;

  const { contactId, text } = (await request.json()) as {
    contactId: string;
    text: string;
  };
  try {
    const { account, phoneNumberId, contact } = await withTenantTransaction(
      teamId,
      async (tx) => {
        const conv = await tx.query.conversationsTable.findFirst({
          where: and(
            eq(conversationsTable.contactId, contactId),
            eq(conversationsTable.direction, "inbound")
          ),
          orderBy: (conversationsTable, { desc }) =>
            desc(conversationsTable.createdAt),
          with: {
            contact: true,
          },
        });

        const contact = await tx.query.contactsTable.findFirst({
          where: eq(contactsTable.id, contactId),
        });

        if (!conv)
          return {
            contact: null,
            account: null,
            phoneNumberId: null,
          };

        const { wabaId, phoneNumberId } = conv.content as WebhookMessage;

        const account = await tx.query.whatsAppBusinessAccountsTable.findFirst({
          where: eq(whatsAppBusinessAccountsTable.id, Number(wabaId)),
        });

        if (!account)
          return {
            contact: null,
            account: null,
            phoneNumberId: null,
          };

        return {
          contact,
          account,
          phoneNumberId,
        };
      }
    );

    if (!account || !account?.accessToken || !contact)
      return new Response(null, { status: 400 });

    const decryptedToken = await decryptApiKey({
      iv: account.accessToken.iv,
      data: account.accessToken.data,
    });

    const config = {
      accessToken: decryptedToken,
      phoneNumberId: Number(phoneNumberId),
      businessAcctId: String(account.id),
    };

    const whatsapp = new WhatsApp(config);

    const response = await whatsapp.messages.text({
      body: text,
      to: contact.normalizedPhone!, // Phone number with country code
    });

    if (!response.messages[0].id) {
      return new Response(null, { status: 400 });
    }

    await withTenantTransaction(teamId, async (tx) => {
      const body: ConversationBody = {
        body: {
          text,
        },
      };

      const conversation: NewConversation = {
        teamId: teamId,
        contactId,
        wamid: response?.messages[0]?.id,
        success: true,
        body,
        userId: user.id,
        direction: "outbound",
      };

      await tx.insert(conversationsTable).values(conversation).returning();
    });

    revalidateTag(`conversations:${teamId}:${contactId}`);

    const usageRepo = new UsageLimitRepository(teamId);
    await usageRepo.upsertUsageTracking(user.id, 1);

    return new Response(JSON.stringify(response), { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new Response(null, { status: 400 });
  }
}
