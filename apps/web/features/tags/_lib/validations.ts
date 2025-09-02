import { Tag } from "@workspace/db/schema";
import { getSortingStateParser } from "@workspace/ui/lib/parsers";
import { createSearchParamsCache, parseAsArrayOf } from "nuqs/server";
import { z } from "zod";

import { createBaseSearchParams } from "@/lib/validations";

export const tagsSearchParamsCache = createSearchParamsCache({
  ...createBaseSearchParams<Tag>(),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  sort: getSortingStateParser<Tag>().withDefault([
    { desc: true, id: "createdAt" },
  ]),
});

export type GetTagSchema = Awaited<
  ReturnType<typeof tagsSearchParamsCache.parse>
>;
