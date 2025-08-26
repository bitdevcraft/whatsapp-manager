import { getValidFilters } from "@workspace/ui/lib/data-table";
import React from "react";

import {
  getAdAccount,
  getWhatsAppBusinessAccountDetails,
} from "@/features/business-account/_lib/queries";
import { getWhatsAppBusinessAccountPhoneNumber } from "@/features/whatsapp/phone-number/_lib/queries";
import { waPhoneNumberSearchParamsCache } from "@/features/whatsapp/phone-number/_lib/validation";
import { SearchParams } from "@/types";

import BusinessAccount from "./business-account";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = waPhoneNumberSearchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getWhatsAppBusinessAccountDetails(),
    getWhatsAppBusinessAccountPhoneNumber({ ...search, filters: validFilters }),
    getAdAccount(),
  ]);
  return (
    <div className="relative w-full ">
      <BusinessAccount promises={promises} />
    </div>
  );
}
