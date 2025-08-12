import MarketingCampaignForm from "./_components/marketing-campaign-form";
import {
  getSelectPhoneNumber,
  getSelectTemplates,
} from "./_components/queries";
import React from "react";
import { getSelectTags } from "@/features/tags/_lib/queries";

export default function Home() {
  const [templates, tags, phoneNumbers] = React.use(
    Promise.all([getSelectTemplates(), getSelectTags(), getSelectPhoneNumber()])
  );

  return (
    <div className="md:p-4 gap-4 ">
      <div className="max-w-3xl mx-auto md:border md:border-muted rounded-xl min-h-[90dvh] p-4 md:p-8 bg-background">
        <MarketingCampaignForm
          templates={templates}
          tags={tags}
          phoneNumbers={phoneNumbers}
        />
      </div>
    </div>
  );
}
