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
import { LanguagesEnum } from "@workspace/wa-cloud-api/types";

export default function MarketingCampaignForm() {
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
    reValidateMode: "onBlur",
    mode: "onChange",
  });

  const onSubmit = async (data: MarketingCampaignFormValues) => {
    console.log("Form submitted:", data);

    try {
      const response = await axios.post(
        "/api/whatsapp/marketing-campaigns",
        data
      );

      console.log(response);
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
                steps={["Template", "Audience", "Details"]}
                currentStep={currentStepIndex}
              />
            </div>
          )}
        </MultiStepFormContextProvider>
      </MultiStepFormHeader>

      <MultiStepFormStep name="template">
        <TemplateStep />
      </MultiStepFormStep>

      <MultiStepFormStep name="audience">
        <AudienceStep />
      </MultiStepFormStep>

      <MultiStepFormStep name="details">
        <DetailsStep />
      </MultiStepFormStep>
    </MultiStepForm>
  );
}
