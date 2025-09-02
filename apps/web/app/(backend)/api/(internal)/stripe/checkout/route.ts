import { db } from "@workspace/db/config";
import { buildConflictUpdateColumns } from "@workspace/db/lib";
import {
  teamMemberLimitsTable,
  teamMembersTable,
  teamsTable,
  usersTable,
} from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { setSession } from "@/lib/auth/session";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/payments/stripe";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");
  const teamId = searchParams.get("teamId");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/ing/account/pricing", request.url));
  }
  if (!teamId) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "subscription"],
    });

    if (!session.customer || typeof session.customer === "string") {
      throw new Error("Invalid customer data from Stripe.");
    }

    const customerId = session.customer.id;

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      throw new Error("No subscription found for this session.");
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price.product"],
    });

    const plan = subscription.items.data[0]?.price;

    if (!plan) {
      throw new Error("No plan found for this subscription.");
    }

    const productId = (plan.product as Stripe.Product).id;

    if (!productId) {
      throw new Error("No product ID found for this subscription.");
    }

    const product = await stripe.products.retrieve(productId);
    const productMetadata = product.metadata;

    const userId = session.client_reference_id;
    if (!userId) {
      throw new Error("No user ID found in session's client_reference_id.");
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error("User not found in database.");
    }

    const userTeam = await db
      .select({
        teamId: teamMembersTable.organizationId,
      })
      .from(teamMembersTable)
      .where(
        and(
          eq(teamMembersTable.userId, user[0]!.id),
          eq(teamMembersTable.organizationId, teamId)
        )
      )
      .limit(1);

    if (userTeam.length === 0) {
      throw new Error("User is not associated with any team.");
    }

    const team = await db
      .update(teamsTable)
      .set({
        planName: (plan.product as Stripe.Product).name,
        stripeCustomerId: customerId,
        stripeMetadata: productMetadata,
        stripeProductId: productId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: subscription.status,
        updatedAt: new Date(),
        whatsappLimit: Number(productMetadata.limit ?? "0"),
        whatsappSubscribeAt: new Date(),
      })
      .where(eq(teamsTable.id, userTeam[0]!.teamId))
      .returning();

    await withTenantTransaction(teamId, async (tx) => {
      const teamMembersLimits = await tx
        .select()
        .from(teamMemberLimitsTable)
        .where(eq(teamMemberLimitsTable.teamId, teamId));

      if (teamMembersLimits.length === 0) {
        //

        const members = await tx.query.teamMembersTable.findMany({
          where: eq(teamMembersTable.organizationId, teamId),
          with: {
            team: true,
          },
        });

        const newMembersLimit: (typeof teamMemberLimitsTable.$inferInsert)[] =
          members.map((member) => ({
            limitType: "inherited",
            maxLimit: member.team.whatsappLimit,
            maxLimitType: "recurring",
            teamId: member.organizationId,
            userId: member.userId,
          }));

        await tx
          .insert(teamMemberLimitsTable)
          .values(newMembersLimit)
          .onConflictDoUpdate({
            set: buildConflictUpdateColumns(teamMemberLimitsTable, [
              "userId",
              "teamId",
            ]),
            target: [
              teamMemberLimitsTable.userId,
              teamMemberLimitsTable.teamId,
            ],
          });
      }
    });

    await setSession(user[0]!, team[0]);
    return NextResponse.redirect(new URL("/ing/dashboard", request.url));
  } catch (error) {
    logger.error("Error handling successful checkout:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}
