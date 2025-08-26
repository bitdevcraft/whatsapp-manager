import { Team } from "@workspace/db/schema";
import { redirect } from "next/navigation";
import Stripe from "stripe";

import { env } from "@/env/server";
import {
  getTeamByStripeCustomerId,
  getUserWithTeam,
  updateTeamSubscription,
} from "@/lib/db/queries";

import { logger } from "../logger";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function createCheckoutSession({
  priceId,
  productId,
  team,
}: {
  priceId: string;
  productId: string;
  team: null | Team;
}) {
  const userWithTeam = await getUserWithTeam();

  if (!team || !userWithTeam?.user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  const { teamId, user } = userWithTeam;

  const product = await stripe.products.retrieve(productId);
  const productMetadata = product.metadata;

  console.log(productMetadata);

  const session = await stripe.checkout.sessions.create({
    allow_promotion_codes: true,
    cancel_url: `${env.BASE_URL}/pricing`,
    client_reference_id: user.id.toString(),
    customer: team.stripeCustomerId || undefined,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: { ...productMetadata },
    mode: "subscription",
    payment_method_types: ["card"],
    success_url: `${env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}&teamId=${teamId}`,
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(team: Team) {
  if (!team.stripeCustomerId || !team.stripeProductId) {
    redirect("/ing/account/pricing");
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0]!;
  } else {
    const product = await stripe.products.retrieve(team.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      active: true,
      product: product.id,
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "Manage your subscription",
      },
      features: {
        payment_method_update: {
          enabled: true,
        },
        subscription_cancel: {
          cancellation_reason: {
            enabled: true,
            options: [
              "too_expensive",
              "missing_features",
              "switched_service",
              "unused",
              "other",
            ],
          },
          enabled: true,
          mode: "at_period_end",
        },
        subscription_update: {
          default_allowed_updates: ["price", "quantity", "promotion_code"],
          enabled: true,
          products: [
            {
              prices: prices.data.map((price) => price.id),
              product: product.id,
            },
          ],
          proration_behavior: "create_prorations",
        },
      },
    });
  }

  return stripe.billingPortal.sessions.create({
    configuration: configuration.id,
    customer: team.stripeCustomerId,
    return_url: `${env.BASE_URL}/dashboard`,
  });
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    active: true,
    expand: ["data.product"],
    type: "recurring",
  });

  return prices.data.map((price) => ({
    currency: price.currency,
    id: price.id,
    interval: price.recurring?.interval,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    trialPeriodDays: price.recurring?.trial_period_days,
    unitAmount: price.unit_amount,
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });

  return products.data.map((product) => ({
    defaultPriceId:
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id,
    description: product.description,
    id: product.id,
    name: product.name,
  }));
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    logger.error("Team not found for Stripe customer:", customerId);
    return;
  }

  if (status === "active" || status === "trialing") {
    const plan = subscription.items.data[0]?.plan;
    await updateTeamSubscription(team.id, {
      planName: (plan?.product as Stripe.Product).name,
      stripeProductId: plan?.product as string,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: status,
    });
  } else if (status === "canceled" || status === "unpaid") {
    await updateTeamSubscription(team.id, {
      planName: null,
      stripeProductId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: status,
    });
  }
}
