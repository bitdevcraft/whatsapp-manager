import { SearchParams } from "@/types";
import { conversationSearchParamsCache } from "@/features/conversations/_lib/validations";
import React from "react";

import { Conversations } from "./conversations";
import { getContactById } from "@/features/contacts/_lib/queries";
import { getSelectTemplates } from "../marketing-campaigns/new/_components/queries";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = conversationSearchParamsCache.parse(searchParams);

  const promises = Promise.all([
    getSelectTemplates(),
    getContactById(search.contact),
  ]);

  return <Conversations promises={promises} searchContact={search.contact} />;
}
