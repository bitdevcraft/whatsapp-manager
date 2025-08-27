import { Contact } from "@workspace/db/schema/contacts";
import {
  getFiltersStateParser,
  getSortingStateParser,
} from "@workspace/ui/lib/parsers";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

import { flagConfig } from "@/config/flag";

export const createBaseSearchParams = <T>() => ({
  filterFlag: parseAsStringEnum(
    flagConfig.featureFlags.map((flag) => flag.value)
  ),
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<T>().withDefault([]),
});

export const searchParamsCache = createSearchParamsCache({
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Contact>().withDefault([
    { desc: true, id: "createdAt" },
  ]),
});

export type GetSchema = Awaited<ReturnType<typeof searchParamsCache.parse>>;
