import { and, desc, eq, sql } from "drizzle-orm";

import {
  teamMemberLimitsTable,
  teamMembersUsageTracking,
  teamsTable,
} from "../schema";
import { withTenantTransaction } from "../tenant";

export class UsageLimitRepository {
  constructor(private readonly teamId: string) {}

  public async getTeamLimit(userId?: string) {
    return withTenantTransaction(this.teamId, async (tx) => {
      const team = await tx.query.teamsTable.findFirst({
        where: eq(teamsTable.id, this.teamId),
      });

      if (!team) return null;

      const subscriptionDate = getSubscriptionPeriod(
        team.whatsappSubscribeAt ?? team.createdAt
      );

      let teamUsage = await tx
        .select({
          limit: sql<number>`AVG(${teamsTable.whatsappLimit})`,
          remaining: sql<number>`AVG(${teamsTable.whatsappLimit}) - SUM(${teamMembersUsageTracking.usageCount})`,
          teamId: teamMembersUsageTracking.teamId,
          used: sql<number>`SUM(${teamMembersUsageTracking.usageCount})`,
        })
        .from(teamMembersUsageTracking)
        .leftJoin(
          teamsTable,
          eq(teamsTable.id, teamMembersUsageTracking.teamId)
        )
        .where(
          and(
            eq(teamMembersUsageTracking.teamId, this.teamId),
            eq(
              teamMembersUsageTracking.periodStart,
              subscriptionDate.periodStart
            ),
            eq(teamMembersUsageTracking.periodEnd, subscriptionDate.periodEnd)
          )
        )
        .orderBy(desc(teamMembersUsageTracking.periodStart))
        .groupBy(
          teamMembersUsageTracking.teamId,
          teamMembersUsageTracking.periodEnd,
          teamMembersUsageTracking.periodStart
        );

      if (teamUsage.length === 0) {
        teamUsage = await tx
          .select({
            limit: sql<number>`AVG(${teamsTable.whatsappLimit})`,
            remaining: sql<number>`AVG(${teamsTable.whatsappLimit})`,
            teamId: teamsTable.id,
            used: sql<number>`0`,
          })
          .from(teamsTable)

          .where(and(eq(teamsTable.id, this.teamId)))
          .groupBy(teamsTable.id);
      }

      let memberLimit: {
        limitType: string;
        maxLimit: null | number;
        maxLimitType: string;
        usage: null | number;
      }[] = [];

      if (userId) {
        let userLimit = await tx.query.teamMemberLimitsTable.findFirst({
          where: and(
            eq(teamMemberLimitsTable.userId, userId),
            eq(teamMemberLimitsTable.teamId, this.teamId)
          ),
        });

        userLimit ??= (
          await tx
            .insert(teamMemberLimitsTable)
            .values([
              {
                limitType: "inherited",
                maxLimit: team.whatsappLimit,
                maxLimitType: "recurring",
                teamId: this.teamId,
                userId,
              },
            ])
            .returning()
        )[0];

        if (!userLimit)
          return { memberLimit: undefined, teamUsage: teamUsage[0] };

        if (
          userLimit.limitType !== "inherited" &&
          userLimit.maxLimitType !== "recurring"
        ) {
          memberLimit = await tx
            .select({
              limitType: sql<string>`MAX(${teamMemberLimitsTable.limitType})`,
              maxLimit: sql<number>`MAX(${teamMemberLimitsTable.maxLimit})`,
              maxLimitType: sql<string>`MAX(${teamMemberLimitsTable.maxLimitType})`,
              usage: sql<number>`SUM(${teamMembersUsageTracking.usageCount})`,
            })
            .from(teamMemberLimitsTable)
            .leftJoin(
              teamMembersUsageTracking,
              and(
                eq(
                  teamMembersUsageTracking.userId,
                  teamMemberLimitsTable.userId
                ),
                eq(
                  teamMembersUsageTracking.teamId,
                  teamMemberLimitsTable.teamId
                )
              )
            )
            .where(
              and(
                eq(teamMemberLimitsTable.userId, userId),
                eq(teamMemberLimitsTable.teamId, this.teamId)
              )
            )
            .orderBy(desc(teamMembersUsageTracking.periodStart))
            .groupBy(
              teamMembersUsageTracking.userId,
              teamMembersUsageTracking.teamId,
              teamMembersUsageTracking.periodEnd,
              teamMembersUsageTracking.periodStart
            );
        } else {
          memberLimit = await tx
            .select({
              limitType: sql<string>`MAX(${teamMemberLimitsTable.limitType})`,
              maxLimit: sql<number>`MAX(${teamMemberLimitsTable.maxLimit})`,
              maxLimitType: sql<string>`MAX(${teamMemberLimitsTable.maxLimitType})`,
              usage: sql<number>`SUM(${teamMembersUsageTracking.usageCount})`,
            })
            .from(teamMemberLimitsTable)
            .leftJoin(
              teamMembersUsageTracking,
              and(
                eq(
                  teamMembersUsageTracking.userId,
                  teamMemberLimitsTable.userId
                ),
                eq(
                  teamMembersUsageTracking.teamId,
                  teamMemberLimitsTable.teamId
                )
              )
            )
            .where(
              and(
                eq(teamMemberLimitsTable.userId, userId),
                eq(teamMemberLimitsTable.teamId, this.teamId),
                eq(
                  teamMembersUsageTracking.periodStart,
                  subscriptionDate.periodStart
                ),
                eq(
                  teamMembersUsageTracking.periodEnd,
                  subscriptionDate.periodEnd
                )
              )
            )
            .orderBy(desc(teamMembersUsageTracking.periodStart))
            .groupBy(
              teamMembersUsageTracking.userId,
              teamMembersUsageTracking.teamId,
              teamMembersUsageTracking.periodEnd,
              teamMembersUsageTracking.periodStart
            );
        }

        if (memberLimit.length === 0) {
          memberLimit = await tx
            .select({
              limitType: sql<string>`MAX(${teamMemberLimitsTable.limitType})`,
              maxLimit: sql<number>`MAX(${teamMemberLimitsTable.maxLimit})`,
              maxLimitType: sql<string>`MAX(${teamMemberLimitsTable.maxLimitType})`,
              usage: sql<number>`0`,
            })
            .from(teamMemberLimitsTable)

            .where(
              and(
                eq(teamMemberLimitsTable.userId, userId),
                eq(teamMemberLimitsTable.teamId, this.teamId)
              )
            );
        }
      }

      return { memberLimit: memberLimit[0], teamUsage: teamUsage[0] };
    });
  }

  public async upsertUsageTracking(userId: string, usage: number) {
    return withTenantTransaction(this.teamId, async (tx) => {
      const team = await tx.query.teamsTable.findFirst({
        where: eq(teamsTable.id, this.teamId),
      });

      if (!team) return null;

      const subscriptionDate = getSubscriptionPeriod(
        team.whatsappSubscribeAt ?? team.createdAt
      );

      const usageTracking: typeof teamMembersUsageTracking.$inferInsert = {
        periodEnd: subscriptionDate.periodEnd,
        periodStart: subscriptionDate.periodStart,
        teamId: this.teamId,
        usageCount: usage,
        userId,
      };

      await tx
        .insert(teamMembersUsageTracking)
        .values([usageTracking])
        .onConflictDoUpdate({
          set: {
            updatedAt: new Date(),
            usageCount: sql`COALESCE(${teamMembersUsageTracking.usageCount}, 0)::INTEGER + ${sql.raw(`excluded."${teamMembersUsageTracking.usageCount.name}"::INTEGER`)}`,
          },
          target: [
            teamMembersUsageTracking.periodEnd,
            teamMembersUsageTracking.periodStart,
            teamMembersUsageTracking.userId,
            teamMembersUsageTracking.teamId,
          ],
        });
    });
  }
}

export function getSubscriptionPeriod(
  startDate: Date,
  referenceDate: Date = new Date()
) {
  const startDay = startDate.getDate();

  // Build a candidate periodStart in the current month of referenceDate
  const periodStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    startDay
  );

  // If referenceDate is before the startDay → shift periodStart to the previous month
  if (referenceDate < periodStart) {
    periodStart.setMonth(periodStart.getMonth() - 1);
  }

  // Period end = one month later - 1 day
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  periodEnd.setDate(periodEnd.getDate() - 1);

  return { periodEnd, periodStart };
}
