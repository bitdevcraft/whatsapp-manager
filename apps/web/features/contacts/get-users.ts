import { db } from "@workspace/db/config";
import { contactsTable } from "@workspace/db/schema/contacts";

export async function getContacts() {
  return await db.select().from(contactsTable);
}
