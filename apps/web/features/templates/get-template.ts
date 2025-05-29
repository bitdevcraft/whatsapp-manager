import { db } from "@workspace/db";
import { templatesTable } from "@workspace/db/schema/templates";
import { syncTemplate } from "./sync-template";

export async function getTemplates(sync = false) {
  if (sync) {
    await syncTemplate();
  }
  return await db.select().from(templatesTable);
}
