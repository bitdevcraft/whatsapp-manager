import { uuid } from "drizzle-orm/pg-core";

import { usersTable } from "../users";
import { baseModel } from "./baseModel";

export const baseModelWithOwner = {
  ...baseModel,
  ownerId: uuid("owner_id")
    .references(() => usersTable.id)
    .notNull(),
};
