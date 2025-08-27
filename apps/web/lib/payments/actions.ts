"use server";

import { redirect } from "next/navigation";

import { withTeam } from "@/lib/auth/middleware";
import {
  createCheckoutSession,
  createCustomerPortalSession,
} from "@/lib/payments/stripe";

export const checkoutAction = withTeam(async (formData, team) => {
  const priceId = formData.get("priceId") as string;
  const productId = formData.get("productId") as string;
  await createCheckoutSession({ priceId, productId, team: team });
});

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});
