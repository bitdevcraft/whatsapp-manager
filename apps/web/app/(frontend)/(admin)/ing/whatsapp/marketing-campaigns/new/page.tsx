import { MessageTemplateForm } from "@/features/templates/forms/message-template";
import MarketingCampaignForm from "./_components/marketing-campaign-form";
import {
  getSelectPhoneNumber,
  getSelectTags,
  getSelectTemplates,
} from "./_components/queries";
import React from "react";

export default function Home() {
  const [templates, tags, phoneNumbers] = React.use(
    Promise.all([getSelectTemplates(), getSelectTags(), getSelectPhoneNumber()])
  );

  return (
    <div className="p-4 grid grid-cols-12 gap-4">
      <div className="col-span-12 md:col-span-6 lg:col-span-7 border border-muted shadow-lg rounded-xl min-h-[90dvh] p-8">
        <MarketingCampaignForm
          templates={templates}
          tags={tags}
          phoneNumbers={phoneNumbers}
        />
        {/* <MessageTemplateForm /> */}
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-5 border border-muted shadow-lg rounded-xl min-h-[90dvh] p-8"></div>
    </div>
  );
}
