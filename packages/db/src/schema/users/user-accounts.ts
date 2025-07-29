import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseModel } from "../abstract/baseModel";
import { usersTable } from "./users";

const { name, ...model } = baseModel;

export const userAccountsTable = pgTable("user_accounts", {
  ...model,
  accessToken: text("access_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  accountId: text("account_id").notNull(),
  idToken: text("id_token"),
  password: text("password"),
  providerId: text("provider_id"),
  refreshToken: text("refresh_token"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
});
