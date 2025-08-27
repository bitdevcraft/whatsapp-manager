import {
  contactsTable,
  conversationsTable,
  marketingCampaignsTable,
} from "@workspace/db";
import { withTenantTransaction } from "@workspace/db/tenant";
import {
  and,
  AnyColumn,
  count,
  eq,
  gte,
  isNotNull,
  lte,
  ne,
  sql,
  SQL,
  sum,
} from "drizzle-orm";

import { getUserWithTeam } from "@/lib/db/queries";
import { unstable_cache } from "@/lib/unstable-cache";

import { GetDashboardSchema } from "./validations";

// Total Contacts
// Total New Contacts of the Month
// Open Rate
// Reply Rate
// Number of Messages Delivered per Day
// Number of Messages Received per Day
// Campaigns Stats

export function buildTeamDateRangeFilter(
  teamIdColumn: AnyColumn,
  teamId: string,
  dateColumn: AnyColumn,
  dateRange: number[]
): SQL | undefined {
  // always filter by team
  const clauses = [eq(teamIdColumn, teamId)];

  const [from, to] = dateRange;
  if (from) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    clauses.push(gte(dateColumn, start));
  }
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    clauses.push(lte(dateColumn, end));
  }

  return and(...clauses);
}

export async function getDashboardAnalytics(input: GetDashboardSchema) {
  const userWithTeam = await getUserWithTeam();

  const dataTemp = {
    deliveryStatus: [],
    marketingCampaignStatus: [],
    messagesDeliveredPerDay: [],
    messagesReceivedPerDay: [],
    openRate: 0,
    replyRate: 0,
    totalContacts: 0,
    totalMessagesSent: 0,
    totalNewContacts: 0,
    totalReplies: 0,
  };

  if (!userWithTeam?.teamId) {
    return dataTemp;
  }

  const { teamId } = userWithTeam;

  return unstable_cache(
    async () => {
      try {
        const {
          deliveryStatus,
          marketingCampaignStatus,
          openRate,
          replyRate,
          totalContacts,
          totalMessagesSent,
          totalNewContacts,
          totalReplies,
        } = await withTenantTransaction(teamId, async (tx) => {
          const totalContacts = await tx.$count(contactsTable);

          const totalNewContacts = await tx.$count(
            contactsTable,
            and(
              buildTeamDateRangeFilter(
                contactsTable.teamId,
                teamId,
                contactsTable.createdAt,
                input.dateRange
              )
            )
          );

          // Count total messages sent (outbound messages)
          const totalMessagesSent = await tx.$count(
            conversationsTable,
            and(
              eq(conversationsTable.teamId, teamId),
              eq(conversationsTable.direction, "outbound")
            )
          );

          // Count total replies (inbound messages)
          const totalReplies = await tx.$count(
            conversationsTable,
            and(
              eq(conversationsTable.teamId, teamId),
              eq(conversationsTable.direction, "inbound")
            )
          );

          const totalConversationByMarketingCampaign = await tx.$count(
            conversationsTable,
            isNotNull(conversationsTable.marketingCampaignId)
          );

          //   Total Recipients
          const totalRecipients = await tx
            .select({ value: sum(marketingCampaignsTable.totalRecipients) })
            .from(marketingCampaignsTable)
            .execute()
            .then((res) => Number(res[0]?.value ?? 0));

          // Open Rate
          const openConversation = await tx.$count(
            conversationsTable,
            and(
              isNotNull(conversationsTable.marketingCampaignId),
              eq(conversationsTable.status, "read")
            )
          );

          const openRate =
            (openConversation / (totalRecipients > 0 ? totalRecipients : 1)) *
            100;

          // Reply Rate
          const campaign = tx.select().from(conversationsTable).as("campaign");
          const reply = tx.select().from(conversationsTable).as("reply");

          const replyCount = await tx
            .select({
              count: count(),
            })
            .from(campaign)
            .leftJoin(reply, eq(reply.repliedTo, campaign.wamid))
            .where(
              and(
                isNotNull(campaign.marketingCampaignId),
                isNotNull(reply.repliedTo),
                ne(reply.repliedTo, "")
              )
            )
            .groupBy(campaign.contactId)
            .execute()
            .then((res) => res[0]?.count ?? 0);

          const replyRate =
            (replyCount /
              (totalConversationByMarketingCampaign > 0
                ? totalConversationByMarketingCampaign
                : 1)) *
            100;

          const marketingCampaignStatus = await tx
            .select({
              count: count(),
              fill: sql<string>`
                'var(--color-' || ${marketingCampaignsTable.status} || ')'
              `,
              status: marketingCampaignsTable.status,
            })
            .from(marketingCampaignsTable)
            .groupBy(marketingCampaignsTable.status);

          const delivered =
            (totalConversationByMarketingCampaign /
              (totalRecipients > 0 ? totalRecipients : 1)) *
            100;

          const failed =
            (totalRecipients -
              totalConversationByMarketingCampaign /
                (totalRecipients > 0 ? totalRecipients : 1)) *
            100;

          const deliveryStatus = [
            {
              fill: "var(--color-delivered)",
              status: "delivered",
              value: delivered,
            },
          ];

          if (failed > 0) {
            deliveryStatus.push({
              fill: "var(--color-failed)",
              status: "failed",
              value: failed > 100 ? 100 - delivered : failed,
            });
          }

          return {
            deliveryStatus,
            marketingCampaignStatus,
            openRate,
            replyRate,
            totalContacts,
            totalMessagesSent,
            totalNewContacts,
            totalReplies,
          };
        });

        return {
          deliveryStatus,
          marketingCampaignStatus,
          messagesDeliveredPerDay: [],
          messagesReceivedPerDay: [],
          openRate,
          replyRate,
          totalContacts,
          totalMessagesSent,
          totalNewContacts,
          totalReplies,
        };
      } catch (error) {
        return dataTemp;
      }
    },
    [`dashboard:${teamId}`],
    {
      revalidate: 10,
      tags: [`dashboard:${teamId}`],
    }
  )();
}
