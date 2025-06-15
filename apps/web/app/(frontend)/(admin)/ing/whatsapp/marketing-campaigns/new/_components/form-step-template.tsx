"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";

import { Template } from "@workspace/db/schema/templates";
import { transformTemplateResponseToFormValues } from "@/features/templates/forms/message-template-actions";
import { MessageTemplateForm } from "@/features/templates/forms/message-template";
import { useMultiStepFormContext } from "@/components/forms/multi-step-form";
import { MarketingCampaignFormSchema } from "@/features/marketing-campaigns/_lib/schema";

function TemplateStep() {
  const [data, setData] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const fetchData = async () => {
    try {
      const response = await axios.get<Template[]>("/api/whatsapp/templates");
      setData(response.data);
    } catch (error) {
      // handle error if needed
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { form, nextStep, isStepValid } =
    useMultiStepFormContext<typeof MarketingCampaignFormSchema>();

  // Memoize transformed default values
  const defaultMessageTemplate = useMemo(() => {
    return selectedTemplate
      ? transformTemplateResponseToFormValues(selectedTemplate.content!)
      : undefined;
  }, [selectedTemplate]);

  // Patch messageTemplate values when template changes
  useEffect(() => {
    if (defaultMessageTemplate) {
      form.setValue("template.messageTemplate", defaultMessageTemplate);
    }
  }, [defaultMessageTemplate, form]);

  return (
    <Form {...form}>
      <div className={"flex flex-col gap-4"}>
        <FormField
          name="template.template"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Template</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const match = data.find((t) => t.name === value);
                    setSelectedTemplate(match ?? null);
                  }}
                  value={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.map((template) => (
                      <SelectItem key={template.name} value={template.name}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedTemplate && (
          <MessageTemplateForm
            form={form}
            namePrefix="template.messageTemplate"
            initialTemplate={selectedTemplate.content!}
          />
        )}

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

export default TemplateStep;
