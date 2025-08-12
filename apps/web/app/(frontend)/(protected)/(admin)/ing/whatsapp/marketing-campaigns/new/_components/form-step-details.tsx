"use client";

import { useMultiStepFormContext } from "@/components/forms/multi-step-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { DateTimePicker } from "@workspace/ui/components/datetimepicker";
import { Checkbox } from "@workspace/ui/components/checkbox"; // or Switch, if you prefer
import { ArrowRight } from "lucide-react";
import { MarketingCampaignFormSchema } from "@/features/marketing-campaigns/_lib/schema";
import { getSelectPhoneNumber } from "./queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface DetailsStepFormProps {
  phoneNumbers: Awaited<ReturnType<typeof getSelectPhoneNumber>>;
}

export default function DetailsStep({ phoneNumbers }: DetailsStepFormProps) {
  const { form, nextStep, isStepValid } =
    useMultiStepFormContext<typeof MarketingCampaignFormSchema>();
  const { control } = form;

  return (
    <Form {...form}>
      <div className="flex flex-col justify-between min-h-[60vh]">
        <div>
          <div className="flex justify-end gap-2">
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
            <h2 className="text-xl font-semibold">Details</h2>
            {/* Campaign Name */}
            <FormField
              control={control}
              name="details.campaignName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter campaign name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Description (optional) */}
            <FormField
              control={control}
              name="details.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Phone Number */}
            <FormField
              control={control}
              name="details.phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    {/* <Input {...field} placeholder="97150xxxxxxx" /> */}
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {phoneNumbers.phoneNumbers.map((phoneNumber) => (
                          <SelectItem
                            key={phoneNumber.value}
                            value={String(phoneNumber.value)}
                          >
                            {phoneNumber.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Schedule */}
            <FormField
              control={control}
              name="details.schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Date</FormLabel>
                  <FormControl>
                    <DateTimePicker name={field.name} control={form.control} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Track */}
            <FormField
              control={control}
              name="details.track"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(val) => field.onChange(!!val)}
                    />
                  </FormControl>
                  <FormLabel className="mb-0">Enable Tracking</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
        {/* navigation */}

        <div className="flex justify-end gap-2">
          <Button onClick={nextStep} disabled={!isStepValid()}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Form>
  );
}
