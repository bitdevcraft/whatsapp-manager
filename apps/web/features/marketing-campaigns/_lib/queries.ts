import { unstable_cache } from "@/lib/unstable-cache";
import { db } from "@workspace/db/config";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  lte,
  ne,
  sql,
} from "drizzle-orm";
import { filterColumns } from "@workspace/ui/lib/filter-columns";
import { GetMarketingCampaignSchema } from "./validations";
import { getUserWithTeam } from "@/lib/db/queries";
import { withTenantTransaction } from "@workspace/db/tenant";
import { marketingCampaignsTable } from "@workspace/db/schema";
import { logger } from "@/lib/logger";
import { contactsTable, conversationsTable } from "@workspace/db";

export async function getMarketingCampaigns(input: GetMarketingCampaignSchema) {
  const userWithTeam = await getUserWithTeam();
  if (!userWithTeam?.teamId) {
    return { data: [], pageCount: 0 };
  }
  if (!userWithTeam?.teamId) {
    return { data: [], pageCount: 0 };
  }

  return await unstable_cache(
    async () => {
      try {
        if (!userWithTeam?.teamId) {
          return { data: [], pageCount: 0 };
        }
        const offset = (input.page - 1) * input.perPage;
        const advancedTable = input.filterFlag === "advancedFilters";

        const advancedWhere = filterColumns({
          table: marketingCampaignsTable,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.name
                ? ilike(marketingCampaignsTable.name, `%${input.name}%`)
                : undefined,
              input.createdAt.length > 0
                ? and(
                    input.createdAt[0]
                      ? gte(
                          marketingCampaignsTable.createdAt,
                          (() => {
                            const date = new Date(input.createdAt[0]);
                            date.setHours(0, 0, 0, 0);
                            return date;
                          })()
                        )
                      : undefined,
                    input.createdAt[1]
                      ? lte(
                          marketingCampaignsTable.createdAt,
                          (() => {
                            const date = new Date(input.createdAt[1]);
                            date.setHours(23, 59, 59, 999);
                            return date;
                          })()
                        )
                      : undefined
                  )
                : undefined
            );

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc
                  ? desc(marketingCampaignsTable[item.id])
                  : asc(marketingCampaignsTable[item.id])
              )
            : [asc(marketingCampaignsTable.createdAt)];

        const { data, total } = await withTenantTransaction(
          userWithTeam?.teamId,
          async (tx) => {
            // const data = await tx
            //   .select()
            //   .from(marketingCampaignsTable)
            //   .where(where)
            //   .limit(input.perPage)
            //   .offset(offset)
            //   .orderBy(...orderBy);

            const data = await tx.query.marketingCampaignsTable.findMany({
              where,
              limit: input.perPage,
              offset,
              orderBy,
              with: {
                template: true,
              },
            });

            const total = await tx
              .select({
                count: count(),
              })
              .from(marketingCampaignsTable)
              .where(where)
              .execute()
              .then((res) => res[0]?.count ?? 0);

            return {
              data,
              total,
            };
          }
        );

        const pageCount = Math.ceil(total / input.perPage);
        return { data, pageCount };
      } catch (error) {
        logger.error(error);
        return { data: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input), userWithTeam?.teamId],
    {
      revalidate: 1,
      tags: [
        "marketing-campaigns",
        `marketing-campaigns:${userWithTeam?.teamId}`,
      ],
    }
  )();
}

export async function getMarketingCampaignById(id: string) {
  const userWithTeam = await getUserWithTeam();
  if (!userWithTeam?.teamId) {
    return {
      data: null,
      messageSent: 0,
      totalRecipients: 0,
      openRate: 0,
      replyRate: 0,
      engagement: 0,
      contacts: null,
    };
  }
  const { teamId } = userWithTeam;

  return await unstable_cache(
    async () => {
      try {
        const {
          data,
          messageSent,
          totalRecipients,
          openRate,
          replyRate,
          contacts,
        } = await withTenantTransaction(teamId, async (tx) => {
          const data = await tx.query.marketingCampaignsTable.findFirst({
            where: eq(marketingCampaignsTable.id, id),
            with: {
              template: true,
            },
          });

          // Total Recipients
          const totalRecipients = data?.totalRecipients ?? 0;

          // Messages Sent
          const messageSent = await tx
            .select({
              count: count(),
            })
            .from(conversationsTable)
            .where(eq(conversationsTable.marketingCampaignId, id))
            .execute()
            .then((res) => res[0]?.count ?? 0);
          // Open Rate
          const openConversation = await tx
            .select({
              count: count(),
            })
            .from(conversationsTable)
            .where(
              and(
                eq(conversationsTable.marketingCampaignId, id),
                eq(conversationsTable.status, "read")
              )
            )
            .execute()
            .then((res) => res[0]?.count ?? 0);

          const openRate =
            (openConversation / (totalRecipients > 0 ? totalRecipients : 1)) *
            100;

          // Reply Rate
          const campaign = tx.select().from(conversationsTable).as("campaign");
          const reply = tx.select().from(conversationsTable).as("reply");

          const replyRate = await tx
            .select({
              count: count(),
            })
            .from(campaign)
            .leftJoin(reply, eq(reply.repliedTo, campaign.wamid))
            .where(
              and(
                eq(campaign.marketingCampaignId, id),
                isNotNull(reply.repliedTo),
                ne(reply.repliedTo, "")
              )
            )
            .groupBy(campaign.contactId)
            .execute()
            .then((res) => res[0]?.count ?? 0);

          const contacts = await tx
            .select({
              name: contactsTable.name,
              id: contactsTable.id,
              phone: contactsTable.phone,
            })
            .from(contactsTable)
            .leftJoin(
              conversationsTable,
              eq(conversationsTable.contactId, contactsTable.id)
            )
            .where(eq(conversationsTable.marketingCampaignId, id));

          // Engagement

          return {
            data,
            messageSent,
            totalRecipients,
            openRate,
            replyRate,
            contacts,
          };
        });

        return {
          data,
          messageSent,
          totalRecipients,
          openRate,
          replyRate,
          engagement: 0,
          contacts,
        };
      } catch (error) {
        return {
          data: null,
          messageSent: 0,
          totalRecipients: 0,
          openRate: 0,
          replyRate: 0,
          engagement: 0,
          contacts: null,
        };
      }
    },
    [`marketing-campaigns:${teamId}:${id}`],
    {
      tags: [
        `marketing-campaigns`,
        `marketing-campaigns:${teamId}:${id}`,
        `marketing-campaigns:${teamId}`,
      ],
      revalidate: 10,
    }
  )();
}
