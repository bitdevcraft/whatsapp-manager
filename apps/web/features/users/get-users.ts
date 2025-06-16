import { db } from "@workspace/db/config";
import { usersTable } from "@workspace/db/schema/users";

export async function getUsers() {
  return await db.select().from(usersTable);
}
