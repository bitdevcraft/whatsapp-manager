import { Filter } from "lucide-react";

export type FlagConfig = typeof flagConfig;

export const flagConfig = {
  featureFlags: [
    {
      icon: Filter,
      label: "",
      tooltipDescription: "",
      tooltipTitle: "Advanced filters",
      value: "advancedFilters" as const,
    },
  ],
};
