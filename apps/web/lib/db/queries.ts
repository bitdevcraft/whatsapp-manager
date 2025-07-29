import { desc, and, eq, isNull } from "drizzle-orm";
import { cookies, headers as nextHeaders } from "next/headers";
import { verifyToken } from "@/lib/auth/session";
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

  // const sessionCookie = (await cookies()).get("session");
  // if (!sessionCookie || !sessionCookie.value) {
  //   return null;
  // }

  // const sessionData = await verifyToken(sessionCookie.value);

  // if (
  //   !sessionData ||
  //   !sessionData.user ||
  //   typeof sessionData.user.id !== "string"
  // ) {
  //   return null;
  // }
  // if (
  //   !sessionData ||
  //   !sessionData.currentTeam ||
  //   typeof sessionData.currentTeam.id !== "string"
  // ) {
  //   return null;
  // }

  // if (new Date(sessionData.expires) < new Date()) {
  //   return null;
  // }

  // const result = await db
  //   .select({
  //     user: usersTable,
  //     teamId: teamMembersTable.organizationId,
  //     teamRole: teamMembersTable.role,
  //   })
  //   .from(usersTable)
  //   .leftJoin(teamMembersTable, eq(usersTable.id, teamMembersTable.userId))
  //   .where(
  //     and(
  //       eq(usersTable.id, sessionData.user.id),
  //       isNull(usersTable.deletedAt),
  //       eq(teamMembersTable.organizationId, sessionData.currentTeam.id)
  //     )
  //   )
  //   .limit(1);

  // if (result.length === 0) {
  //   return null;
  // }

  //   return user[0];

  //   const result = await db
  //     .select({
  //       user: usersTable,
  //       teamId: teamMembersTable.teamId,
  //     })
  //     .from(usersTable)
  //     .leftJoin(teamMembersTable, eq(usersTable.id, teamMembersTable.userId))
  //     .where(and(eq(usersTable.id, userId)))
  //     .limit(1);

  // return result[0];
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
