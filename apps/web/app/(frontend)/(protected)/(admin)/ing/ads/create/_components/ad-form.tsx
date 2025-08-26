"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DateTimePicker } from "@workspace/ui/components/datetimepicker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { MultiSelect } from "@workspace/ui/components/multi-select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import React from "react";
import { useForm } from "react-hook-form";

import { toTitleCase } from "@/utils/string-helper";

import {
  AdCampaignSchema,
  MultiStepAdsFormValues,
  MultiStepAdsSchema,
} from "./schema";

const optimization_goal: Record<string, string[]> = {
  OUTCOME_ENGAGEMENT: ["CONVERSATIONS", "LINK_CLICKS"],
  OUTCOME_LEADS: ["CONVERSATIONS"],
  OUTCOME_SALES: [
    "CONVERSATIONS",
    "OFFSITE_CONVERSIONS",
    "LINK_CLICKS",
    "IMPRESSIONS",
    "REACH",
  ],
  OUTCOME_TRAFFIC: [
    "CONVERSATIONS",
    "LANDING_PAGE_VIEWS",
    "LINK_CLICKS",
    "IMPRESSIONS",
    "REACH",
    "POST_ENGAGEMENT",
  ],
};

export function AdForm() {
  const form = useForm<MultiStepAdsFormValues>({
    defaultValues: {
      adSet: {
        billing_event: "IMPRESSIONS",
        destination_type: "WHATSAPP",
        end_time: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        name: "Click to WhatsApp Ads",
        optimization_goal: undefined,
        promoted_object: {
          page_id: "",
        },
        start_time: new Date(),
        targeting: {
          age_max: 65,
          age_min: 18,
          genders: [0],
        },
      },
      campaign: {
        name: "Click to WhatsApp Ads",
        objective: undefined,
        special_ad_categories: [],
        status: undefined,
      },
    },
    resolver: zodResolver(MultiStepAdsSchema),
  });

  const [optimizationGoal, setOptimizationGoal] = React.useState<string[]>([]);

  const [budgetType, setBudgetType] = React.useState<
    "daily_budget" | "lifetime_budget"
  >("daily_budget");
  // React.useEffect(() => {
  //   if (optimization_goal[form.getValues().campaign.objective]) {
  //     setOptimizationGoal(
  //       optimization_goal[form.getValues().campaign.objective]
  //     );
  //   }
  // }, [form]);

  return (
    <div>
      <Form {...form}>
        <form action="" className="p-2 grid gap-4">
          <h1>Campaign</h1>
          <FormCard>
            <FormField
              control={form.control}
              name="campaign.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Campaign Name"
                      {...field}
                      className="shadow-none border-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormCard>
          <FormCard>
            <FormField
              control={form.control}
              name="campaign.objective"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Campaign Objective</FormLabel>
                  <FormControl>
                    <RadioGroup
                      defaultValue={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        if (optimization_goal[v]) {
                          setOptimizationGoal(optimization_goal[v]);
                          form.resetField("adSet.optimization_goal", {
                            defaultValue: undefined,
                          });
                        }
                      }}
                    >
                      {AdCampaignSchema.shape.objective.options.map((el) => (
                        <div className="flex items-center gap-3" key={el}>
                          <RadioGroupItem
                            className="border-muted-foreground shadow-none"
                            id={el}
                            value={el}
                          />
                          <Label className="font-normal text-md" htmlFor={el}>
                            {toTitleCase(el, { outcome: "" })}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormCard>
          <FormCard>
            <FormField
              control={form.control}
              name="campaign.special_ad_categories"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Special Ad Categories</FormLabel>
                  <FormControl>
                    <MultiSelect
                      className="shadow-none border-muted"
                      maxCount={4}
                      onValueChange={field.onChange}
                      options={AdCampaignSchema.shape.special_ad_categories.element.options.map(
                        (c) => ({
                          label: toTitleCase(c),
                          value: c,
                        })
                      )}
                      placeholder="Declare category if applicable"
                      value={field.value || []}
                      variant="default"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormCard>

          <h1>Ad Set</h1>

          <FormCard>
            <FormField
              control={form.control}
              name="adSet.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Set Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ad Set Name"
                      {...field}
                      className="shadow-none border-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormCard>

          <FormCard>
            <FormField
              control={form.control}
              name="adSet.optimization_goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Set Name</FormLabel>
                  {form.getValues().adSet.optimization_goal}
                  {field.value}
                  <Select
                    defaultValue={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {optimizationGoal.map((el) => (
                        <SelectItem key={el} value={el}>
                          Maximize number of {toTitleCase(el).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormCard>

          <FormCard className="grid gap-6">
            <h2>Budget</h2>
            <div className="flex">
              <Select
                defaultValue={budgetType}
                onValueChange={(v) => {
                  // @ts-expect-error not
                  setBudgetType(v);
                  if (v === "daily_budget")
                    form.setValue("adSet.lifetime_budget", undefined);
                  else form.setValue("adSet.daily_budget", undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue className="rounded-r-none" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily_budget">Daily budget</SelectItem>
                  <SelectItem value="lifetime_budget">
                    Lifetime budget
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormField
                control={form.control}
                name={`adSet.${budgetType}`}
                render={({ field }) => (
                  <FormItem className="w-full ">
                    <FormControl>
                      <Input
                        placeholder="Budget"
                        {...field}
                        className="shadow-none border-muted w-full rounded-l-none"
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="adSet.start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      control={form.control}
                      dateFormat="MMM dd, yyyy HH:mm"
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adSet.end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      control={form.control}
                      dateFormat="MMM dd, yyyy HH:mm"
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormCard>

          <FormCard className="grid gap-6">
            <h2>Audience</h2>

            <div className="flex">
              <FormField
                control={form.control}
                name="adSet.targeting.age_min"
                render={({ field }) => (
                  <FormItem className="">
                    <Select
                      defaultValue={String(field.value)}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="h-96 text-center">
                        {Array.from({ length: 48 }, (_, i) => i + 18).map(
                          (age) => (
                            <SelectItem key={age} value={`${age}`}>
                              {age}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adSet.targeting.age_max"
                render={({ field }) => (
                  <FormItem className="">
                    <Select
                      defaultValue={String(field.value)}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="h-96 text-center">
                        {Array.from({ length: 48 }, (_, i) => i + 18).map(
                          (age) => (
                            <SelectItem key={age} value={`${age}`}>
                              {age}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="adSet.targeting.genders"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="flex"
                      defaultValue={String(field.value[0])}
                      onValueChange={(v) => {
                        field.onChange([Number(v)]);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          className="border-muted-foreground shadow-none"
                          id="gender.all"
                          value={String(0)}
                        />
                        <Label
                          className="font-normal text-md"
                          htmlFor="gender.all"
                        >
                          All
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          className="border-muted-foreground shadow-none"
                          id="gender.male"
                          value={String(1)}
                        />
                        <Label
                          className="font-normal text-md"
                          htmlFor="gender.male"
                        >
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          className="border-muted-foreground shadow-none"
                          id="gender.female"
                          value={String(2)}
                        />
                        <Label
                          className="font-normal text-md"
                          htmlFor="gender.female"
                        >
                          Female
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormCard>
        </form>
      </Form>
    </div>
  );
}

function FormCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(className, "rounded p-4 bg-background")}
      {...props}
    ></div>
  );
}
