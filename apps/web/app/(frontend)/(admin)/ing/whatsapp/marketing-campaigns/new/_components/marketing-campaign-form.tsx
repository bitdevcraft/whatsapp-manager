"use client";

import {
  createStepSchema,
  MultiStepForm,
  MultiStepFormContextProvider,
  MultiStepFormHeader,
  MultiStepFormStep,
} from "@/components/forms/multi-step-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stepper } from "@workspace/ui/components/stepper";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TemplateStep from "./form-step-template";
import AudienceStep from "./form-step-audience";
import DetailsStep from "./form-step-details";
import { useTitle } from "@/components/provider/title-provider";
import { useEffect } from "react";
import {
  MarketingCampaignFormSchema,
  MarketingCampaignFormValues,
} from "@/features/marketing-campaigns/_lib/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import axios from "axios";
import { LanguagesEnum } from "@workspace/wa-cloud-api";
import { logger } from "@/lib/logger";
import { getSelectPhoneNumber, getSelectTemplates } from "./queries";
import { getSelectTags } from "@/features/tags/_lib/queries";

interface MarketingCampaignFormProps {
  templates: Awaited<ReturnType<typeof getSelectTemplates>>;
  tags: Awaited<ReturnType<typeof getSelectTags>>;
  phoneNumbers: Awaited<ReturnType<typeof getSelectPhoneNumber>>;
}

export default function MarketingCampaignForm({
  templates,
  tags,
  phoneNumbers,
}: MarketingCampaignFormProps) {
  const router = useRouter();

  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Create Marketing Campaign");
  }, [setTitle]);

  const form = useForm<MarketingCampaignFormValues>({
    resolver: zodResolver(MarketingCampaignFormSchema),
    defaultValues: {
      template: {
        template: "",
        messageTemplate: {
          name: "",
          language: {
            policy: "deterministic",
            code: LanguagesEnum.English,
          },
          components: [],
        },
      },
      audience: {
        tags: [],
        phone: [],
      },
      details: {
        campaignName: "",
        description: "",
        phoneNumber: "",
        schedule: null,
        track: false,
      },
    },
    // reValidateMode: "onBlur",
    mode: "onChange",
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
    } catch (error: any) {
      toast.error("Unsuccessful", {
        description: `Please reach out the admin with this issue: ${error.message}`,
      });
    }
  };

  return (
    <MultiStepForm
      className={"space-y-10"}
      schema={MarketingCampaignFormSchema}
      form={form}
      onSubmit={onSubmit}
    >
      <MultiStepFormHeader
        className={"flex w-full flex-col justify-center space-y-6"}
      >
        <h2 className={"text-xl font-bold"}>Create your account</h2>

        <MultiStepFormContextProvider>
          {({ currentStepIndex }) => (
            <div className="">
              <Stepper
                variant={"numbers"}
                steps={["Details", "Template", "Audience"]}
                currentStep={currentStepIndex}
              />
            </div>
          )}
        </MultiStepFormContextProvider>
      </MultiStepFormHeader>

      <MultiStepFormStep name="details">
        <DetailsStep phoneNumbers={phoneNumbers} />
      </MultiStepFormStep>

      <MultiStepFormStep name="template">
        <TemplateStep templates={templates} />
      </MultiStepFormStep>

      <MultiStepFormStep name="audience">
        <AudienceStep tags={tags} />
      </MultiStepFormStep>
    </MultiStepForm>
  );
}
