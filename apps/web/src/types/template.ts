import { TemplateResponse as BaseTemplateResponse } from "@workspace/wa-cloud-api";

export interface TemplateMeta {
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  id?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface AppTemplateResponse extends Omit<BaseTemplateResponse, 'id'> {
  meta?: TemplateMeta;
  // Make id optional since we might have unsaved templates
  id?: string;
}
