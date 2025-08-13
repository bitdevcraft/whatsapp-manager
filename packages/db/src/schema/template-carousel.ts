import { jsonb, pgTable } from "drizzle-orm/pg-core";

import { baseModel } from "./abstract/baseModel";

export const templateCarouselsTable = pgTable("template_carousels", {
  ...baseModel,
  template: jsonb("template"),
});
