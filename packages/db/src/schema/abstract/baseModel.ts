import { varchar } from "drizzle-orm/pg-core";
import { baseIdModel } from "./baseIdModel";
import { baseTimestampModel } from "./baseTimestampModel";

export const baseModel = {
  ...baseIdModel,
  name: varchar("name", { length: 255 }).notNull(),
  ...baseTimestampModel,
};
