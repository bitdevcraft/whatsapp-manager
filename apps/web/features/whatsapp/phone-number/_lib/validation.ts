import { createBaseSearchParams } from "@/lib/validations";
import { WhatsAppBusinessAccountPhoneNumber } from "@workspace/db";
import { getSortingStateParser } from "@workspace/ui/lib/parsers";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString,
} from "nuqs/server";
import { z } from "zod";

// …and pull out `foo`, leaving everything else in `restParams`
const { name, ...restParams } =
  createBaseSearchParams<WhatsAppBusinessAccountPhoneNumber>();

export const waPhoneNumberSearchParamsCache = createSearchParamsCache({
  ...restParams,
  displayPhoneNumber: parseAsString.withDefault(""),
  sort: getSortingStateParser<WhatsAppBusinessAccountPhoneNumber>().withDefault(
    [{ id: "createdAt", desc: true }]
  ),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
});

export type GetWaPhoneNumberSchema = Awaited<
  ReturnType<typeof waPhoneNumberSearchParamsCache.parse>
>;
