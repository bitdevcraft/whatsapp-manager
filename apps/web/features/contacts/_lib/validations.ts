import { createBaseSearchParams } from "@/lib/validations";
import { Contact } from "@workspace/db/schema/contacts";
import { getSortingStateParser } from "@workspace/ui/lib/parsers";
import { createSearchParamsCache, parseAsArrayOf } from "nuqs/server";
import { z } from "zod";

export const contactSearchParamsCache = createSearchParamsCache({
  ...createBaseSearchParams<Contact>(),
  sort: getSortingStateParser<Contact>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
});

export type GetContactSchema = Awaited<
  ReturnType<typeof contactSearchParamsCache.parse>
>;
