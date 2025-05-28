import { db } from "@workspace/db";
import { templatesTable } from "@workspace/db/schema/templates";

export async function getTemplates() {
  return await db.select().from(templatesTable);
}
