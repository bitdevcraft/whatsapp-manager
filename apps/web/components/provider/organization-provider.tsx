// src/context/OrganizationContext.tsx
"use client";

import { Organization } from "better-auth/plugins/organization";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
} from "react";

import { authClient } from "@/lib/auth/auth-client";

import { CubeLoader } from "../loaders/cube-loader";

// shape of our context value
interface OrgContextValue {
  activeOrganization: null | Organization;
  error?: Error;
  isLoading: boolean;
  organizations: Array<Organization>;
  setActiveOrganization: (orgId: string) => Promise<void>;
}

const OrganizationContext = createContext<OrgContextValue | undefined>(
  undefined
);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  // fetch all orgs
  const {
    data: organizations,
    error: listError,
    isPending: loadingOrgs,
    isRefetching: refetchingOrgs,
    refetch: refetchOrgs,
  } = authClient.useListOrganizations();

  const {
    data: activeOrganization,
    error: activeError,
    isPending: loadingActive,
    isRefetching: refetchingActive,
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
        activeOrganization: activeOrganization ?? null,
        error: error as Error | undefined,
        isLoading,
        organizations: organizations ?? [],
        setActiveOrganization,
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
