import { SearchParams } from "@/types";
import { conversationSearchParamsCache } from "@/features/conversations/_lib/validations";
import { getValidFilters } from "@workspace/ui/lib/data-table";
import {
  getConversations,
  getConversationSearch,
} from "@/features/conversations/_lib/queries";
import React from "react";

import { Conversations } from "./conversations";
import { getContactById } from "@/features/contacts/_lib/queries";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = conversationSearchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getConversations({ ...search, filters: validFilters }),
  ]);

  const contact = getContactById(search.contact);

  return (
    <Conversations
      promises={promises}
      searchContact={search.contact}
      contactPromise={contact}
    />
  );
}
