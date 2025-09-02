import { WhatsAppBusinessAccountPhoneNumber } from "@workspace/db";
import { getSortingStateParser } from "@workspace/ui/lib/parsers";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString,
} from "nuqs/server";
import { z } from "zod";

import { createBaseSearchParams } from "@/lib/validations";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { name, ...restParams } =
  createBaseSearchParams<WhatsAppBusinessAccountPhoneNumber>();

export const waPhoneNumberSearchParamsCache = createSearchParamsCache({
  ...restParams,
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  displayPhoneNumber: parseAsString.withDefault(""),
  sort: getSortingStateParser<WhatsAppBusinessAccountPhoneNumber>().withDefault(
    [{ id: "createdAt", desc: true }]
  ),
});

export type GetWaPhoneNumberSchema = Awaited<
  ReturnType<typeof waPhoneNumberSearchParamsCache.parse>
>;
