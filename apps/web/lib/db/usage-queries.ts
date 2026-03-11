"use server";

import { UsageLimitRepository } from "@workspace/db";
import { unstable_noStore } from "next/cache";

import { getUserWithTeam } from "./queries";

export async function getUsage() {
  unstable_noStore();

  const userWithTeam = await getUserWithTeam();

  const value = {
    personal: {
      limit: 0,
      usage: 0,
    },
    team: {
      limit: 0,
      usage: 0,
    },
  };

  if (!userWithTeam?.teamId) return value;

  const { teamId, user } = userWithTeam;

  const repo = new UsageLimitRepository(teamId);

  const result = await repo.getTeamLimit(user.id);
  const isInheritedLimit =
    !result?.memberLimit || result.memberLimit.limitType === "inherited";

  return {
    personal: {
      limit:
        isInheritedLimit
          ? (result?.teamUsage?.limit ?? 0)
          : (result?.memberLimit?.maxLimit ?? 0),
      usage: result?.memberLimit?.usage ?? 0,
    },
    team: {
      limit: result?.teamUsage?.limit ?? 0,
      usage: result?.teamUsage?.used ?? 0,
    },
  };
}
