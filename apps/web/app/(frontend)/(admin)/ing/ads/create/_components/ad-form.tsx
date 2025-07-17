import { useForm } from "react-hook-form";
import { MultiStepAdsFormValues, MultiStepAdsSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";

export function AdForm() {
  const form = useForm<MultiStepAdsFormValues>({
    resolver: zodResolver(MultiStepAdsSchema),
    defaultValues: {
      campaign: {
        name: "Click to WhatsApp Ads",
        objective: "OUTCOME_ENGAGEMENT",
        special_ad_categories: [],
        status: undefined,
      },
      adSet: {
        billing_event: "IMPRESSIONS",
        destination_type: "WHATSAPP",
        name: "Click to WhatsApp Ads",
        optimization_goal: "LINK_CLICKS",
        promoted_object: {
          page_id: "",
        },
        targeting: {},
      },
    },
  });

  return <div></div>;
}
