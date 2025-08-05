import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, admin, member, owner } from "@workspace/auth/permissions";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      // @ts-expect-error statements
      ac,
      roles: {
        owner,
        admin,
        member,
      },
    }),
  ],
});
