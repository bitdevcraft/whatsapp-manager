import { desc, eq } from "drizzle-orm";
import { headers as nextHeaders } from "next/headers";
import { db } from "@workspace/db/config";
import {
  activityLogsTable,
  teamMembersTable,
  teamsTable,
  usersTable,
} from "@workspace/db/schema";
import { auth } from "@workspace/auth";

export async function getUser() {
  const headers = await nextHeaders();

  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    return null;
  }

  return session.user;
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teamsTable)
    .where(eq(teamsTable.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: string,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teamsTable)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teamsTable.id, teamId));
}

export async function getUserWithTeam() {
  const headers = await nextHeaders();

  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    return null;
  }

  return {
    user: session.user,
    teamId: session.session.activeOrganizationId,
  };
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  return await db
    .select({
      id: activityLogsTable.id,
      action: activityLogsTable.action,
      timestamp: activityLogsTable.timestamp,
      ipAddress: activityLogsTable.ipAddress,
      userName: usersTable.name,
    })
    .from(activityLogsTable)
    .leftJoin(usersTable, eq(activityLogsTable.userId, usersTable.id))
    .where(eq(activityLogsTable.userId, usersTable.id))
    .orderBy(desc(activityLogsTable.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembersTable.findFirst({
    where: eq(teamMembersTable.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.team || null;
}

export async function getTeamsForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembersTable.findMany({
    where: eq(teamMembersTable.userId, user.id),
    with: {
      team: true,
    },
  });

  // const currentTeam = await db
  return result;
}


