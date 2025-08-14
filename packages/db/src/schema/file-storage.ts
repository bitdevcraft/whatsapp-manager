import { integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { enumToValues } from "../enums/enum-helper";
import { timestamps } from "../helpers/column-helper";
import { baseIdModel } from "./abstract/baseIdModel";
import { teamsTable } from "./teams";

export enum FileLocation {
  "AWS" = "aws_s3",
  "LOCAL" = "local",
}

export const fileLocationEnum = pgEnum(
  "file-location",
  enumToValues(FileLocation)
);

export const fileAttachmentsTable = pgTable("file_attachment", {
  ...baseIdModel,
  expiresIn: timestamp("expires_in"),
  fileLocation: fileLocationEnum(),
  fileSize: integer("file_size"),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id),
  ...timestamps,
});

export type FileAttachment = typeof fileAttachmentsTable.$inferSelect;
export type NewFileAttachment = typeof fileAttachmentsTable.$inferInsert;
