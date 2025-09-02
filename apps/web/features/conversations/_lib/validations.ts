import { Conversation } from "@workspace/db/schema/conversations";
import { getSortingStateParser } from "@workspace/ui/lib/parsers";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
} from "nuqs/server";
import { z } from "zod";

import { createBaseSearchParams } from "@/lib/validations";

export const conversationSearchParamsCache = createSearchParamsCache({
  ...createBaseSearchParams<Conversation>(),
  contact: parseAsString.withDefault(""),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  search: parseAsString.withDefault(""),
  sort: getSortingStateParser<Conversation>().withDefault([
    { desc: true, id: "createdAt" },
  ]),
  unread: parseAsBoolean.withDefault(false),
});

export type GetConversationSchema = Awaited<
  ReturnType<typeof conversationSearchParamsCache.parse>
>;
