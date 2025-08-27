import { Template } from "@workspace/db/schema/templates";
import { getSortingStateParser } from "@workspace/ui/lib/parsers";
import { createSearchParamsCache, parseAsArrayOf, parseAsString } from "nuqs/server";
import { z } from "zod";

import { createBaseSearchParams } from "@/lib/validations";

export const templateSearchParamsCache = createSearchParamsCache({
  ...createBaseSearchParams<Template>(),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  rId: parseAsString.withDefault(""),
  sort: getSortingStateParser<Template>().withDefault([
    { desc: true, id: "createdAt" },
  ]),
});

export type GetTemplateSchema = Awaited<
  ReturnType<typeof templateSearchParamsCache.parse>
>;
