import { CommandIcon, FileSpreadsheetIcon, Filter } from "lucide-react";

export type FlagConfig = typeof flagConfig;

export const flagConfig = {
  featureFlags: [
    {
      label: "",
      value: "advancedFilters" as const,
      icon: Filter,
      tooltipTitle: "Advanced filters",
      tooltipDescription: "",
    },
    // {
    //   label: "Command filters",
    //   value: "commandFilters" as const,
    //   icon: CommandIcon,
    //   tooltipTitle: "Command filter chips",
    //   tooltipDescription: "Linear like command palette for filtering rows.",
    // },
  ],
};
