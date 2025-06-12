import { createBaseSearchParams } from "@/lib/validations";
import { Tag } from "@workspace/db/schema";
import { getSortingStateParser } from "@workspace/ui/lib/parsers";
import { createSearchParamsCache, parseAsArrayOf } from "nuqs/server";
import { z } from "zod";

export const tagsSearchParamsCache = createSearchParamsCache({
  ...createBaseSearchParams<Tag>(),
  sort: getSortingStateParser<Tag>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
});

export type GetTagSchema = Awaited<
  ReturnType<typeof tagsSearchParamsCache.parse>
>;
