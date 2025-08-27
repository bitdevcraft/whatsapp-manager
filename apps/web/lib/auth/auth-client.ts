import { ac, admin, member, owner } from "@workspace/auth/permissions";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      // @ts-expect-error statements
      ac,
      roles: {
        admin,
        member,
        owner,
      },
    }),
  ],
});
