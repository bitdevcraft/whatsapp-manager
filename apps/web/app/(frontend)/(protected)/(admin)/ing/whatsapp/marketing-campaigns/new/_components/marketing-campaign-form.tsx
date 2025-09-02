"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Stepper } from "@workspace/ui/components/stepper";
import { LanguagesEnum } from "@workspace/wa-cloud-api";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  MultiStepForm,
  MultiStepFormContextProvider,
  MultiStepFormHeader,
  MultiStepFormStep,
} from "@/components/forms/multi-step-form";
import { useTitle } from "@/components/provider/title-provider";
import {
  MarketingCampaignFormSchema,
  MarketingCampaignFormValues,
} from "@/features/marketing-campaigns/_lib/schema";
import { getSelectTags } from "@/features/tags/_lib/queries";

import AudienceStep from "./form-step-audience";
import DetailsStep from "./form-step-details";
import TemplateStep from "./form-step-template";
import { getSelectPhoneNumber, getSelectTemplates } from "./queries";

interface MarketingCampaignFormProps {
  phoneNumbers: Awaited<ReturnType<typeof getSelectPhoneNumber>>;
  tags: Awaited<ReturnType<typeof getSelectTags>>;
  templates: Awaited<ReturnType<typeof getSelectTemplates>>;
}

export default function MarketingCampaignForm({
  phoneNumbers,
  tags,
  templates,
}: MarketingCampaignFormProps) {
  const router = useRouter();

  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Create Marketing Campaign");
  }, [setTitle]);

  const form = useForm<MarketingCampaignFormValues>({
    defaultValues: {
      audience: {
        phone: [],
        tags: [],
      },
      details: {
        campaignName: "",
        description: "",
        phoneNumber: "",
        schedule: null,
        track: false,
      },
      template: {
        messageTemplate: {
          components: [],
          language: {
            code: LanguagesEnum.English,
            policy: "deterministic",
          },
          name: "",
        },
        template: "",
      },
    },
    // reValidateMode: "onBlur",
    mode: "onChange",
    resolver: zodResolver(MarketingCampaignFormSchema),
  });

  const onSubmit = async (data: MarketingCampaignFormValues) => {
    try {
      const response = await axios.post(
        "/api/whatsapp/marketing-campaigns",
        data
      );

      toast.success("Marketing Campaign has been created", {
        description: "Successful",
      });

      router.push(`/ing/whatsapp/marketing-campaigns/${response.data.data.id}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Unsuccessful", {
        description: `Please reach out the admin with this issue: ${error.message}`,
      });
    }
  };

  return (
    <MultiStepForm
      className={"space-y-10"}
      form={form}
      onSubmit={onSubmit}
      schema={MarketingCampaignFormSchema}
    >
      <MultiStepFormHeader
        className={"flex w-full flex-col justify-center space-y-6"}
      >
        <h2 className={"text-xl font-bold"}>Create your account</h2>

        <MultiStepFormContextProvider>
          {({ currentStepIndex }) => (
            <div className="">
              <Stepper
                currentStep={currentStepIndex}
                steps={["Details", "Template", "Audience"]}
                variant={"numbers"}
              />
            </div>
          )}
        </MultiStepFormContextProvider>
      </MultiStepFormHeader>

      <MultiStepFormStep className="max-w-xl mx-auto" name="details">
        <DetailsStep phoneNumbers={phoneNumbers} />
      </MultiStepFormStep>

      <MultiStepFormStep name="template">
        <TemplateStep templates={templates} />
      </MultiStepFormStep>

      <MultiStepFormStep className="max-w-xl mx-auto" name="audience">
        <AudienceStep tags={tags} />
      </MultiStepFormStep>
    </MultiStepForm>
  );
}
