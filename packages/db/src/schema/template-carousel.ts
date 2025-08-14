import { jsonb, pgTable, uuid } from "drizzle-orm/pg-core";

import { baseModel } from "./abstract/baseModel";
import { teamsTable } from "./teams";

export const templateCarouselsTable = pgTable("template_carousels", {
  ...baseModel,
  payload: jsonb("payload"),
  teamId: uuid("team_id").references(() => teamsTable.id),
  template: jsonb("template"),
});
