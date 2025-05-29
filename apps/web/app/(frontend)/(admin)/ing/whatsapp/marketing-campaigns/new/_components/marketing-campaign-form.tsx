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

export const FormSchema = createStepSchema({
  template: z.object({
    template: z.string().min(3),
  }),
  audience: z.object({
    tags: z.array(z.string()),
    phone: z.array(z.string()),
  }),
  details: z.object({
    campaignName: z.string().min(3),
    description: z.string().optional(),
    phoneNumber: z.string().nonempty(),
    schedule: z.date().nullable(),
    track: z.boolean(),
  }),
});

export type FormValues = z.infer<typeof FormSchema>;

export default function MarketingCampaignForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      template: {
        template: "",
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

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
  };

  return (
    <MultiStepForm
      className={"space-y-10"}
      schema={FormSchema}
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
