"use server";

import { redirect } from "next/navigation";
import {
  createCheckoutSession,
  createCustomerPortalSession,
} from "@/lib/payments/stripe";
import { withTeam } from "@/lib/auth/middleware";

export const checkoutAction = withTeam(async (formData, team) => {
  const priceId = formData.get("priceId") as string;
  const productId = formData.get("productId") as string;
  await createCheckoutSession({ team: team, priceId, productId });
});

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});
