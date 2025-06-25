import { eq, sql } from "drizzle-orm";
import {
  FileAttachment,
  fileAttachmentsTable,
  NewFileAttachment,
} from "../schema/file-storage";
import { teamsTable } from "../schema";
import { withTenantTransaction } from "../tenant";

export function createFileRepository() {
  /**
   * Inserts a new file attachment and increments
   * the team's currentFileStorageSize accordingly.
   */
  async function insertFileAttachment(
    teamId: string,
    attachmentData: NewFileAttachment
  ): Promise<FileAttachment | undefined> {
    return await withTenantTransaction(teamId, async (tx) => {
      const [inserted] = await tx
        .insert(fileAttachmentsTable)
        .values(attachmentData)
        .returning();

      if (!inserted) {
        return undefined;
      }

      const { teamId, fileSize } = inserted;
      await tx
        .update(teamsTable)
        .set({
          currentFileStorageSize: sql`
                        ${teamsTable.currentFileStorageSize}
                        +
                        ${fileSize}
                    `,
        })
        .where(eq(teamsTable.id, teamId));

      return inserted;
    });
  }

  /**
   * Deletes a file attachment and decrements
   * the team's currentFileStorageSize accordingly.
   */
  async function deleteFileAttachment(
    teamId: string,
    attachmentId: string
  ): Promise<void> {
    return await withTenantTransaction(teamId, async (tx) => {
      const attachment = await tx
        .select({
          teamId: fileAttachmentsTable.teamId,
          fileSize: fileAttachmentsTable.fileSize,
        })
        .from(fileAttachmentsTable)
        .where(eq(fileAttachmentsTable.id, attachmentId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!attachment) {
        return;
      }

      const { teamId, fileSize } = attachment;
      await tx
        .delete(fileAttachmentsTable)
        .where(eq(fileAttachmentsTable.id, attachmentId));

      await tx
        .update(teamsTable)
        .set({
          currentFileStorageSize: sql`
                        ${teamsTable.currentFileStorageSize}
                        -
                        ${fileSize}
                    `,
        })
        .where(eq(teamsTable.id, teamId));
    });
  }

  return {
    insertFileAttachment,
    deleteFileAttachment,
  };
}
