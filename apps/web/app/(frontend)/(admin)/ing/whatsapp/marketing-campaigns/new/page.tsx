import { MessageTemplateForm } from "@/features/whatsapp/templates/forms/message-template";
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
    <div className="md:p-4 gap-4">
      <div className="max-w-3xl mx-auto md:border md:border-muted shadow-lg rounded-xl min-h-[90dvh] p-4 md:p-8">
        <MarketingCampaignForm
          templates={templates}
          tags={tags}
          phoneNumbers={phoneNumbers}
        />
        {/* <MessageTemplateForm /> */}
      </div>
      {/* <div className="col-span-12 md:col-span-6 lg:col-span-5 border border-muted shadow-lg rounded-xl min-h-[90dvh] p-8"></div> */}
    </div>
  );
}
