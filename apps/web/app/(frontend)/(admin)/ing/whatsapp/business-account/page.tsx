import { getWhatsAppBusinessAccountDetails } from "@/features/whatsapp/business-account/_lib/queries";
import BusinessAccount from "./business-account";
import React from "react";
import { getWhatsAppBusinessAccountPhoneNumber } from "@/features/whatsapp/phone-number/_lib/queries";
import { waPhoneNumberSearchParamsCache } from "@/features/whatsapp/phone-number/_lib/validation";
import { getValidFilters } from "@workspace/ui/lib/data-table";
import { SearchParams } from "@/types";

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
  ]);
  return (
    <>
      <BusinessAccount promises={promises} />
    </>
  );
}
