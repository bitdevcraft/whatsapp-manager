import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { baseModel } from "../abstract/baseModel";

const { name, ...model } = baseModel;

export const userVerificationsTable = pgTable("user_verifications", {
  ...model,
  expiresAt: timestamp("expires_at"),
  identifier: text("identifier"),
  value: text("value"),
});
