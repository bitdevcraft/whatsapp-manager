"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { MultiSelect } from "@workspace/ui/components/multi-select";
import { PhoneInput } from "@workspace/ui/components/phone-input";
import { ArrowLeft, ArrowRight } from "lucide-react";
import * as React from "react";
import { useFieldArray } from "react-hook-form";

import { useMultiStepFormContext } from "@/components/forms/multi-step-form";
import { MarketingCampaignFormSchema } from "@/features/marketing-campaigns/_lib/schema";
import { getSelectTags } from "@/features/tags/_lib/queries";

interface AudienceStepFormProps {
  tags: Awaited<ReturnType<typeof getSelectTags>>;
}

function AudienceStep({ tags }: AudienceStepFormProps) {
  const { form, prevStep } =
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
              onClick={prevStep}
              size="icon"
              type="button"
              variant="outline"
            >
              <ArrowLeft />
            </Button>
            <Button disabled size="icon" type="button" variant="outline">
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
                      maxCount={3}
                      onValueChange={field.onChange}
                      options={tags}
                      placeholder="Select tags"
                      value={field.value || []}
                      variant="default"
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
                control={control}
                key={field.id}
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
                      onClick={() => phonesArray.remove(idx)}
                      size="icon"
                      type="button"
                      variant="destructive"
                    >
                      ×
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              onClick={() => phonesArray.append({ value: "" })}
              type="button"
              variant="outline"
            >
              + Add Phone
            </Button>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={prevStep} type="button" variant="outline">
            Previous
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
}

export default AudienceStep;
