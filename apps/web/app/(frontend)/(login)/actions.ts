"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db/config";
import {
  usersTable,
  teamMembersTable,
  activityLogsTable,
  type NewActivityLog,
  invitationsTable,
} from "@workspace/db/schema";
import { ActivityType } from "@workspace/db/enums";
import { getUserWithTeam } from "@/lib/db/queries";
import { validatedActionWithUser } from "@/lib/auth/middleware";
import { withTenantTransaction } from "@workspace/db/tenant";

async function logActivity(
  teamId: string | null | undefined,
  userId: string,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || "",
  };

  await withTenantTransaction(teamId, async (tx) => {
    await tx.insert(activityLogsTable).values(newActivity);
  });
}

const removeTeamMemberSchema = z.object({
  memberId: z.string(),
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam();

    if (!userWithTeam?.teamId) {
      return { error: "User is not part of a team" };
    }

    await db
      .delete(teamMembersTable)
      .where(
        and(
          eq(teamMembersTable.id, memberId),
          eq(teamMembersTable.organizationId, userWithTeam?.teamId)
        )
      );

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: "Team member removed successfully" };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["member", "owner"]),
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam();

    if (!userWithTeam?.teamId) {
      return { error: "User is not part of a team" };
    }

    const existingMember = await db
      .select()
      .from(usersTable)
      .leftJoin(teamMembersTable, eq(usersTable.id, teamMembersTable.userId))
      .where(
        and(
          eq(usersTable.email, email),
          eq(teamMembersTable.organizationId, userWithTeam?.teamId)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: "User is already a member of this team" };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitationsTable)
      .where(
        and(
          eq(invitationsTable.email, email),
          eq(invitationsTable.teamId, userWithTeam?.teamId),
          eq(invitationsTable.status, "pending")
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: "An invitation has already been sent to this email" };
    }

    // Create a new invitation
    await db.insert(invitationsTable).values({
      teamId: userWithTeam?.teamId,
      email,
      role,
      invitedBy: user.id,
      status: "pending",
    });

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithTeam.team.name, role)

    return { success: "Invitation sent successfully" };
  }
);
