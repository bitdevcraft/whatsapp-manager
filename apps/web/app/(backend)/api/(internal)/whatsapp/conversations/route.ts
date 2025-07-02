import { getConversations } from "@/features/conversations/get-conversations";
import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import {
  contactsTable,
  ConversationBody,
  conversationsTable,
  NewConversation,
  whatsAppBusinessAccountsTable,
} from "@workspace/db";
import { withTenantTransaction } from "@workspace/db/tenant";
import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function GET() {
  const result = await getConversations();
  return new Response(JSON.stringify(result), { status: 200 });
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
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(null, { status: 400 });
  }
}
