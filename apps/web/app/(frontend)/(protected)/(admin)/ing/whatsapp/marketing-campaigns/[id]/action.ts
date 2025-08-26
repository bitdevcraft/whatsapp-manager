"use server";

import { getUserWithTeam } from "@/lib/db/queries";
import { ContactRepository, UsageLimitRepository } from "@workspace/db";
import { unstable_cache, unstable_noStore } from "next/cache";

export async function hasRemainingUsage(id: string): Promise<{
  success: boolean;
  message?: string;
  remaining?: number;
  contactCount?: number;
}> {
  unstable_noStore();

  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return {
      success: false,
      message: "No Team",
    };
  }

  const { teamId, user } = userWithTeam;

  const usageRepo = new UsageLimitRepository(teamId);

  const usages = await usageRepo.getTeamLimit(user.id);

  const contactRepo = new ContactRepository(teamId);

  const contactCount = await contactRepo.countContactByMarketingCampaignId(id);

  const limit =
    usages?.memberLimit?.limitType === "inherited"
      ? (usages?.teamUsage?.limit ?? 0)
      : (usages?.memberLimit?.maxLimit ?? 0);

  const remaining = limit - (usages?.memberLimit?.usage ?? 0);

  if (remaining < contactCount) {
    return {
      success: false,
      message: `Remaining Balance is Limited (Remaining:${remaining}). Please limit your recipients`,
      remaining,
      contactCount,
    };
  }

  return {
    success: true,
  };
}

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

      console.log(await contactRepo.countContactByMarketingCampaignId(id));

      return contactRepo.countContactByMarketingCampaignId(id);
    },
    [id],
    {
      tags: [id],
      revalidate: 10,
    }
  )();
}
