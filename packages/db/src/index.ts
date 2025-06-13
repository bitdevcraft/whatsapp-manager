import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@workspace/db/schema";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

import { sql } from "drizzle-orm";

async function printCurrentRole() {
  // @ts-ignore
  const [{ current_user }] = await db
    .select({ current_user: sql`current_user` })
    .from(sql`(SELECT 1)`) // dummy table
    .execute();
  console.log("Connected as role:", current_user);
}

printCurrentRole();
