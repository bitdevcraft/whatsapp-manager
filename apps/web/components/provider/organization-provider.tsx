// src/context/OrganizationContext.tsx
"use client";

import { authClient } from "@/lib/auth/auth-client";
import { Organization } from "better-auth/plugins/organization";
import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { CubeLoader } from "../loaders/cube-loader";

// shape of our context value
interface OrgContextValue {
  organizations: Array<Organization>;
  activeOrganization: Organization | null;
  setActiveOrganization: (orgId: string) => Promise<void>;
  isLoading: boolean;
  error?: Error;
}

const OrganizationContext = createContext<OrgContextValue | undefined>(
  undefined
);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  // fetch all orgs
  const {
    data: organizations,
    isPending: loadingOrgs,
    isRefetching: refetchingOrgs,
    error: listError,
    refetch: refetchOrgs,
  } = authClient.useListOrganizations();

  const {
    data: activeOrganization,
    isPending: loadingActive,
    isRefetching: refetchingActive,
    error: activeError,
    refetch: refetchActive,
  } = authClient.useActiveOrganization();

  const setActiveOrganization = useCallback(
    async (orgId: string) => {
      await authClient.organization.setActive({ organizationId: orgId });
      await Promise.all([refetchOrgs(), refetchActive()]);
    },
    [refetchOrgs, refetchActive]
  );

  const isLoading =
    loadingOrgs || refetchingOrgs || loadingActive || refetchingActive;
  const error = listError || activeError;

  if (isLoading)
    return (
      <div className="absolute top-1/2 left-1/2 -translate-y-[50%] -translate-x-[50%]">
        <CubeLoader />
      </div>
    );

  return (
    <OrganizationContext.Provider
      value={{
        organizations: organizations ?? [],
        activeOrganization: activeOrganization ?? null,
        setActiveOrganization,
        isLoading,
        error: error as Error | undefined,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx)
    throw new Error(
      "useOrganization must be used within an <OrganizationProvider>"
    );
  return ctx;
}
