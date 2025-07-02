import { getUserWithTeam } from "@/lib/db/queries";
import { unstable_cache } from "@/lib/unstable-cache";
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
import { GetDashboardSchema } from "./validations";

// Total Contacts
// Total New Contacts of the Month
// Open Rate
// Reply Rate
// Number of Messages Delivered per Day
// Number of Messages Received per Day
// Campaigns Stats

export async function getDashboardAnalytics(input: GetDashboardSchema) {
  const userWithTeam = await getUserWithTeam();

  const dataTemp = {
    totalContacts: 0,
    totalNewContacts: 0,
    openRate: 0,
    replyRate: 0,
    messagesDeliveredPerDay: [],
    messagesReceivedPerDay: [],
    marketingCampaignStatus: [],
    deliveryStatus: [],
  };

  if (!userWithTeam?.teamId) {
    return dataTemp;
  }

  const { teamId } = userWithTeam;

  return unstable_cache(
    async () => {
      try {
        const {
          totalContacts,
          totalNewContacts,
          openRate,
          replyRate,
          marketingCampaignStatus,
          deliveryStatus,
        } = await withTenantTransaction(teamId, async (tx) => {
          const totalContacts = await tx.$count(contactsTable);

          console.log("Total Contacts", totalContacts);

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

          const totalConversationByMarketingCampaign = await tx.$count(
            conversationsTable,
            isNotNull(conversationsTable.marketingCampaignId)
          );

          console.log("Total New Contacts", totalNewContacts);

          //   Total Recipients
          const totalRecipients = await tx
            .select({ value: sum(marketingCampaignsTable.totalRecipients) })
            .from(marketingCampaignsTable)
            .execute()
            .then((res) => Number(res[0]?.value) ?? 0);

          console.log("Total Recipients", totalRecipients);

          // Open Rate
          const openConversation = await tx.$count(
            conversationsTable,
            and(
              isNotNull(conversationsTable.marketingCampaignId),
              eq(conversationsTable.status, "read")
            )
          );

          console.log("Open Conversation", openConversation);

          const openRate =
            (openConversation / (totalRecipients > 0 ? totalRecipients : 1)) *
            100;

          console.log("Open Rate", openRate);

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
              status: marketingCampaignsTable.status,
              count: count(),
              fill: sql<string>`
                'var(--color-' || ${marketingCampaignsTable.status} || ')'
              `,
            })
            .from(marketingCampaignsTable)
            .groupBy(marketingCampaignsTable.status);

          const delivered =
            (totalConversationByMarketingCampaign /
              (totalRecipients > 0 ? totalRecipients : 1)) *
            100;

          console.log(
            "Delivery Status",
            totalConversationByMarketingCampaign,
            totalRecipients
          );

          const failed =
            (totalRecipients -
              totalConversationByMarketingCampaign /
                (totalRecipients > 0 ? totalRecipients : 1)) *
            100;

          const deliveryStatus = [
            {
              status: "delivered",
              value: delivered,
              fill: "var(--color-delivered)",
            },
          ];

          if (failed > 0) {
            deliveryStatus.push({
              status: "failed",
              value: failed,
              fill: "var(--color-failed)",
            });
          }

          return {
            totalContacts,
            totalNewContacts,
            openRate,
            replyRate,
            marketingCampaignStatus,
            deliveryStatus,
          };
        });

        return {
          totalContacts,
          totalNewContacts,
          openRate,
          replyRate,
          messagesDeliveredPerDay: [],
          messagesReceivedPerDay: [],
          marketingCampaignStatus,
          deliveryStatus,
        };
      } catch (error) {
        console.log("ERROR", error);
        return dataTemp;
      }
    },
    [`dashboard:${teamId}`],
    {
      tags: [`dashboard:${teamId}`],
    }
  )();
}

export function buildTeamDateRangeFilter<T>(
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
