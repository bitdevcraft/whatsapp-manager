import { ActivityType, db, NewActivityLog } from "@workspace/db";
import * as schema from "@workspace/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, organization } from "better-auth/plugins";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

import { getActiveOrganization } from "./get-active-organization";
import { ac, admin, member, owner } from "./permissions";

import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  advanced: {
    database: {
      generateId: () => uuidv4(),
    },
  },

  baseURL: process.env.BASE_URL!,

  // Database
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      account: schema.userAccountsTable,
      invitation: schema.teamInvitationsTable,
      member: schema.teamMembersTable,
      organization: schema.teamsTable,
      session: schema.userSessionsTable,
      user: schema.usersTable,
      verification: schema.userVerificationsTable,
    },
  }),

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organization = await getActiveOrganization(session.userId);

          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id,
            },
          };
        },
      },
    },
    user: {
      create: {
        after: async (user) => {
          await auth.api.createOrganization({
            body: {
              metadata: { personal: true },
              name: `${user.name}'s Organization`,
              slug: user.id,
              userId: user.id,
            },
          });
        },
      },
    },
  },

  // Auth
  emailAndPassword: {
    enabled: true,
    onPasswordReset: async ({ user }, request) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
    sendResetPassword: async ({ user, url, token }, request) => {
      await resend.emails.send({
        from: "No-Reply <noreply@ingeniousuae.com>",
        subject: "Password Reset",
        text: `Click the link to verify your email: ${url}`,
        to: [user.email],
      });
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Execute before processing the request

      /**
       * /sign-out
       * /sign-in
       * /sign-up
       * /update-user
       * /reset-password
       * /change-password
       * /organization/invite-member
       * /organization/accept-invitation
       */
      let activity: string = "";

      if (ctx.path.startsWith("/sign-up")) {
        activity = ActivityType.SIGN_UP;
      }
      if (ctx.path.startsWith("/sign-out")) {
        activity = ActivityType.SIGN_OUT;
      }
      if (ctx.path.startsWith("/sign-up")) {
        activity = ActivityType.SIGN_UP;
      }
      if (ctx.path.startsWith("/update-user")) {
        activity = ActivityType.UPDATE_ACCOUNT;
      }
      if (ctx.path === "/reset-password" || ctx.path === "/change-password") {
        activity = ActivityType.UPDATE_PASSWORD;
      }
      if (ctx.path.startsWith("/organization/invite-member")) {
        activity = ActivityType.INVITE_TEAM_MEMBER;
      }
      if (ctx.path.startsWith("/organization/accept-invitation")) {
        activity = ActivityType.ACCEPT_INVITATION;
      }

      const newActivityLog: NewActivityLog = {
        teamId: "",
        action: "",
      };
    }),
  },

  // Plugins
  plugins: [
    organization({
      ac,
      roles: {
        admin,
        member,
        owner,
      },
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.BASE_URL!}/accept-invitation/${data.id}`;
        await resend.emails.send({
          from: "No-Reply <noreply@ingeniousuae.com>",
          subject: "Team Invitation",
          text: `You are invited by ${data.inviter.user.name}. Click the link to verify your email: ${inviteLink}`,
          to: [data.email],
        });
      },
    }),
  ],

  rateLimit: {
    max: 100, // max requests in the window
    window: 10, // time window in seconds
  },

  // Session
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },

  trustedOrigins: [
    process.env.BASE_URL!,
    `${process.env.BASE_URL!}/auth/reset-password`,
  ],
});
