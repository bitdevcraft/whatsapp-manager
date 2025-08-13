import { uuid } from "drizzle-orm/pg-core";

import { teamsTable } from "../teams";
import { baseModel } from "./baseModel";

export const baseModelWithWorkspace = {
  ...baseModel,
  organizationId: uuid("organization_id")
    .references(() => teamsTable.id)
    .notNull(),
};
