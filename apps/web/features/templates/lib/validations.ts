import { createBaseSearchParams } from "@/lib/validations";
import { Template } from "@workspace/db/schema/templates";
import { getSortingStateParser } from "@workspace/ui/lib/parsers";
import { createSearchParamsCache, parseAsArrayOf } from "nuqs/server";
import { z } from "zod";

export const templateSearchParamsCache = createSearchParamsCache({
  ...createBaseSearchParams<Template>(),
  sort: getSortingStateParser<Template>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
});

export type GetTemplateSchema = Awaited<
  ReturnType<typeof templateSearchParamsCache.parse>
>;
