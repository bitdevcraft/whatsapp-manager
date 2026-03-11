"use server";

import { ContactRepository, UsageLimitRepository } from "@workspace/db";
import { unstable_cache, unstable_noStore } from "next/cache";

import { getUserWithTeam } from "@/lib/db/queries";

export async function getEstimatedRecipients(id: string) {
  unstable_noStore();

  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return 0;
  }

  const { teamId } = userWithTeam;

  return unstable_cache(
    async () => {
      const contactRepo = new ContactRepository(teamId);

      return contactRepo.countContactByMarketingCampaignId(id);
    },
    [id],
    {
      revalidate: 10,
      tags: [id],
    }
  )();
}

export async function hasRemainingUsage(id: string): Promise<{
  contactCount?: number;
  message?: string;
  remaining?: number;
  success: boolean;
}> {
  unstable_noStore();

  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return {
      message: "No Team",
      success: false,
    };
  }

  const { teamId, user } = userWithTeam;

  const usageRepo = new UsageLimitRepository(teamId);

  const usages = await usageRepo.getTeamLimit(user.id);

  const contactRepo = new ContactRepository(teamId);

  const contactCount = await contactRepo.countContactByMarketingCampaignId(id);

  const isInheritedLimit =
    !usages?.memberLimit || usages.memberLimit.limitType === "inherited";

  const limit =
    isInheritedLimit
      ? (usages?.teamUsage?.limit ?? 0)
      : (usages?.memberLimit?.maxLimit ?? 0);

  const remaining = limit - (usages?.memberLimit?.usage ?? 0);

  if (remaining < contactCount) {
    return {
      contactCount,
      message: `Remaining Balance is Limited (Remaining:${remaining}). Please limit your recipients`,
      remaining,
      success: false,
    };
  }

  return {
    success: true,
  };
}
