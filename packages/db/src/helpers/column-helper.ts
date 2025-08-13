import { timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  updatedAt: timestamp("updated_at"),
};

export const baseSchema = {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ...timestamps,
};
