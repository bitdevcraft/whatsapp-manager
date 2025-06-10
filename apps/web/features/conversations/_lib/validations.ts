import { createBaseSearchParams } from "@/lib/validations";
import { Conversation } from "@workspace/db/schema/conversations";
import { getSortingStateParser } from "@workspace/ui/lib/parsers";
import { createSearchParamsCache, parseAsArrayOf } from "nuqs/server";
import { z } from "zod";

export const conversationSearchParamsCache = createSearchParamsCache({
  ...createBaseSearchParams<Conversation>(),
  sort: getSortingStateParser<Conversation>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
});

export type GetConversationSchema = Awaited<
  ReturnType<typeof conversationSearchParamsCache.parse>
>;
