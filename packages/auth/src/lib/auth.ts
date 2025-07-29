import { db } from "@workspace/db";
import * as schema from "@workspace/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { v4 as uuidv4 } from "uuid";
import { getActiveOrganization } from "./get-active-organization";

export const auth = betterAuth({
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

  // Auth
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      console.log(`Click the link to reset your password: ${url}`);
    },
  },

  // Plugins
  plugins: [organization()],

  // Session
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },

  advanced: {
    database: {
      generateId: () => uuidv4(),
    },
  },

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
              name: `${user.name ?? "User"}'s Organization`,
              slug: `${user.id}`,
              metadata: { personal: true },
              userId: user.id,
            },
          });
        },
      },
    },
  },
});
