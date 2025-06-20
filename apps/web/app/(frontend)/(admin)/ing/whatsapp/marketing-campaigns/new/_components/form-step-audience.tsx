"use client";

import { useMultiStepFormContext } from "@/components/forms/multi-step-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { PhoneInput } from "@workspace/ui/components/phone-input";
import { MultiSelect } from "@workspace/ui/components/multi-select";
import { useFieldArray } from "react-hook-form";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MarketingCampaignFormSchema } from "@/features/marketing-campaigns/_lib/schema";
import * as React from "react";
import { getSelectTags } from "./queries";

const tagsList = [
  { value: "real-estate", label: "Real Estate" },
  { value: "vip", label: "VIP" },
  { value: "social-media", label: "Social Media" },
];

interface AudienceStepFormProps {
  tags: Awaited<ReturnType<typeof getSelectTags>>;
}

function AudienceStep({ tags }: AudienceStepFormProps) {
  const { form, nextStep, prevStep } =
    useMultiStepFormContext<typeof MarketingCampaignFormSchema>();

  const { control } = form;

  // two dynamic arrays
  const phonesArray = useFieldArray({
    control,
    name: "audience.phone",
  });

  return (
    <Form {...form}>
      <div className="flex flex-col justify-between min-h-[60vh]">
        <div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={prevStep}
            >
              <ArrowLeft />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={nextStep}
            >
              <ArrowRight />
            </Button>
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Audience</h2>
            {/* ——— Tags ——— */}
            <FormField
              control={form.control}
              name="audience.tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 select-none text-sm font-normal">
                    Tags
                  </FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={tags.tags}
                      onValueChange={field.onChange}
                      value={field.value || []}
                      placeholder="Select tags"
                      variant="default"
                      maxCount={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <hr />
            {/* ——— Phones ——— */}
            {phonesArray.fields.map((field, idx) => (
              <FormField
                key={field.id}
                control={control}
                name={`audience.phone.${idx}.value`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl className="flex-1">
                      <PhoneInput
                        placeholder="+971 50 XXX XXXX"
                        {...field}
                        defaultCountry="AE"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => phonesArray.remove(idx)}
                    >
                      ×
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => phonesArray.append({ value: "" })}
            >
              + Add Phone
            </Button>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={prevStep}>
            Previous
          </Button>
          <Button onClick={nextStep}>Next</Button>
        </div>
      </div>
    </Form>
  );
}

export default AudienceStep;
