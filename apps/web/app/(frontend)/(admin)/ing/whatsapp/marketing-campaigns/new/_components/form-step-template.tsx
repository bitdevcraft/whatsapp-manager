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
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import axios from "axios";
import { useEffect, useState } from "react";
import { Template } from "@workspace/db/schema/templates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { ArrowRight } from "lucide-react";
import { MarketingCampaignFormSchema } from "@/features/marketing-campaigns/_lib/schema";
import { MessageTemplateForm } from "@/features/templates/forms/message-template";

function TemplateStep() {
  const [data, setData] = useState<Template[]>([]);

  const fetchData = async () => {
    try {
      const response = await axios.get<Template[]>("/api/whatsapp/templates");
      if (response.data) {
        setData(response.data);
      }
    } catch (error) {
      //
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { form, nextStep, isStepValid } =
    useMultiStepFormContext<typeof MarketingCampaignFormSchema>();

  return (
    <>
      <Form {...form}>
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
        <div className={"flex flex-col gap-4"}>
          <FormField
            name="template.template"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Select Template</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.map((template, idx) => (
                          <SelectItem key={template.name} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className="flex justify-end gap-2">
            <Button onClick={nextStep} disabled={!isStepValid()}>
              Next
            </Button>
          </div>
        </div>
      </Form>
    </>
  );
}

export default TemplateStep;
