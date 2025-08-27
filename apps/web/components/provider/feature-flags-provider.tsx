// components/feature-flags-provider.tsx
"use client";

import { useQueryState } from "nuqs";
import React, { createContext, useCallback, useContext, useMemo } from "react";

import { FlagConfig, flagConfig } from "@/config/flag";

export interface FeatureFlagsContextValue {
  clearFilterFlag: () => void; // ← added here
  enableAdvancedFilter: boolean;
  filterFlag: FilterFlag | null;
  onFilterFlagChange: (value: FilterFlag) => void;
}

type FilterFlag = FlagConfig["featureFlags"][number]["value"];

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | undefined>(
  undefined
);

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [filterFlag, setFilterFlag] = useQueryState<FilterFlag | null>(
    "filterFlag",
    {
      clearOnDefault: true,
      defaultValue: null,
      eq: (a, b) => (!a && !b) || a === b,
      parse: (v) => {
        if (!v) return null;
        const valid = flagConfig.featureFlags.map((f) => f.value);
        return valid.includes(v as FilterFlag) ? (v as FilterFlag) : null;
      },
      serialize: (v) => v ?? "",
      shallow: false,
    }
  );

  const onFilterFlagChange = useCallback(
    (value: FilterFlag) => setFilterFlag(value),
    [setFilterFlag]
  );
  const clearFilterFlag = useCallback(
    () => setFilterFlag(null),
    [setFilterFlag]
  ); // ← and here

  const enableAdvancedFilter =
    filterFlag === "advancedFilters" || filterFlag === "commandFilters";

  const value = useMemo(
    () => ({
      clearFilterFlag, // ← and include here
      enableAdvancedFilter,
      filterFlag,
      onFilterFlagChange,
    }),
    [filterFlag, enableAdvancedFilter, onFilterFlagChange, clearFilterFlag]
  );

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagsContextValue {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagsProvider"
    );
  }
  return ctx;
}
