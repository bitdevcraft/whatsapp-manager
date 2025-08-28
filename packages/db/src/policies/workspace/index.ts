/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import { sql } from "drizzle-orm";
import { ExtraConfigColumn, pgPolicy } from "drizzle-orm/pg-core";

// 1) Build a generic Organization‐policy factory
export function createOrganizationPolicies<
  T extends {
    deletedAt?: ExtraConfigColumn;
    teamId: ExtraConfigColumn;
  },
>(tableName: string, t: T) {
  const ROLE = process.env.POSTGRES_USER_ROLE!;
  const sessionCheck = sql`${t.teamId} = current_setting('app.current_tenant')::uuid`;

  return [
    pgPolicy(`${tableName}_select_tenant`, {
      for: "select",
      to: ROLE,
      using: sessionCheck,
    }),
    pgPolicy(`${tableName}_insert_tenant`, {
      for: "insert",
      to: ROLE,
      withCheck: sessionCheck,
    }),
    pgPolicy(`${tableName}_update_tenant`, {
      for: "update",
      to: ROLE,
      using: sessionCheck,
      withCheck: sessionCheck,
    }),
    pgPolicy(`${tableName}_delete_tenant`, {
      for: "delete",
      to: ROLE,
      using: sessionCheck,
    }),
  ];
}
