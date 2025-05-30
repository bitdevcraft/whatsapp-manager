import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import {
  getFiltersStateParser,
  getSortingStateParser,
} from "@workspace/ui/lib/parsers";
import { Contact } from "@workspace/db/schema/contacts";
import { flagConfig } from "@/config/flag";

export const createBaseSearchParams = <T>() => ({
  filterFlag: parseAsStringEnum(
    flagConfig.featureFlags.map((flag) => flag.value)
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<T>().withDefault([]),
  name: parseAsString.withDefault(""),
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Contact>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type GetSchema = Awaited<ReturnType<typeof searchParamsCache.parse>>;
