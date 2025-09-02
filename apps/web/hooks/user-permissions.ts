import { useQuery } from "@tanstack/react-query"; // or SWR, Zustand, etc.

import { authClient } from "@/lib/auth/auth-client";

type Permissions = Parameters<
  typeof authClient.organization.hasPermission
>[0]["permissions"];

/**
 * Caches the result of /organization/has-permission for this user +
 * the requested permission set.
 */
export function usePermission(
  permissions: Permissions,
  organizationId: string
) {
  return useQuery({
    queryFn: async () => {
      const { data, error } = await authClient.organization.hasPermission({
        permissions,
      });

      return !data || error ? false : data.success;
    },
    queryKey: ["permission", permissions, organizationId], // memoised per-scope

    staleTime: 5 * 60 * 1000,
  });
}
