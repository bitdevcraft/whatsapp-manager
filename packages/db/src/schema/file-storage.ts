import { integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../helpers/column-helper";
import { enumToValues } from "../enums/enum-helper";
import { relations } from "drizzle-orm";
import { teamsTable } from "./teams";
import { baseIdModel } from "./abstract/baseIdModel";

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
  fileLocation: fileLocationEnum(),
  fileSize: integer("file_size"),
  expiresIn: timestamp("expires_in"),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id),
  ...timestamps,
});

export type FileAttachment = typeof fileAttachmentsTable.$inferSelect;
export type NewFileAttachment = typeof fileAttachmentsTable.$inferInsert;
