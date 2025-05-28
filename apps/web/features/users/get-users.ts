import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema/users";

export async function getUsers() {
  return await db.select().from(usersTable);
}
