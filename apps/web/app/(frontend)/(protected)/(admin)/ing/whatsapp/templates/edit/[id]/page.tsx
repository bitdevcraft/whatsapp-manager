import { getTemplateById } from "@/features/whatsapp/templates/lib/queries";

import { EditPage } from "./edit-page";

interface IndexPageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: IndexPageProps) {
  const { id } = await params;

  const promises = Promise.all([getTemplateById(id)]);

  return <EditPage promises={promises} />;
}
