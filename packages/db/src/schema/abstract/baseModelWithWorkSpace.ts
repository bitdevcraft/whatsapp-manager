import { text, uuid } from "drizzle-orm/pg-core";

import { baseModel } from "./baseModel";
import { teamsTable } from "../teams";

export const baseModelWithWorkspace = {
  ...baseModel,
  organizationId: uuid("organization_id")
    .references(() => teamsTable.id)
    .notNull(),
};
