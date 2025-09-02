import { TemplateResponse as BaseTemplateResponse } from "@workspace/wa-cloud-api";

export interface AppTemplateResponse extends Omit<BaseTemplateResponse, "id"> {
  // Make id optional since we might have unsaved templates
  id?: string;
  meta?: TemplateMeta;
}

export interface TemplateMeta {
  approvedAt?: string;
  id?: string;
  rejectionReason?: string;
  status: "APPROVED" | "DRAFT" | "PENDING" | "REJECTED";
  submittedAt?: string;
}
