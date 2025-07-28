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
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Template } from "@workspace/db/schema/templates";
import { transformTemplateResponseToFormValues } from "@/features/whatsapp/templates/forms/message-template-actions";
import { MessageTemplateForm } from "@/features/whatsapp/templates/forms/message-template";
import { useMultiStepFormContext } from "@/components/forms/multi-step-form";
import { MarketingCampaignFormSchema } from "@/features/marketing-campaigns/_lib/schema";
import { getSelectTemplates } from "./queries";

interface TemplateStepFormProps {
  templates: Awaited<ReturnType<typeof getSelectTemplates>>;
}

function TemplateStep({ templates }: TemplateStepFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const { form, nextStep, isStepValid, prevStep } =
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
    const templateId = form.getValues().template.template;

    if (templateId) {
      const match = templates.templates.find((t: any) => t.id === templateId);
      setSelectedTemplate(match ?? null);
    }
  }, [defaultMessageTemplate, form]);

  return (
    <Form {...form}>
      <div className={"flex flex-col gap-4"}>
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
        <FormField
          name="template.template"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Template</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const match = templates.templates.find(
                      (t) => t.id === value
                    );
                    setSelectedTemplate(match ?? null);
                  }}
                  value={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
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
            preview
          />
        )}

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

export default TemplateStep;
