import { revalidateTag } from "next/cache";

export function revalidateTemplateTags(teamId: string, templateId?: string) {
  if (templateId) {
    revalidateTag(templateId, { expire: 0 });
  }

  revalidateTag(`templates:select:${teamId}`, { expire: 0 });
  revalidateTag(`templates:${teamId}`, { expire: 0 });
}
