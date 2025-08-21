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
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Template } from "@workspace/db/schema/templates";
import { useMultiStepFormContext } from "@/components/forms/multi-step-form";
import { MarketingCampaignFormSchema } from "@/features/marketing-campaigns/_lib/schema";
import { getSelectTemplates } from "./queries";
import { SingleTemplatePreview } from "../../[id]/template-preview";
import { MessageTemplateFormV2 } from "./template-form/message-template-form";

interface TemplateStepFormProps {
  templates: Awaited<ReturnType<typeof getSelectTemplates>>;
}

function TemplateStep({ templates }: TemplateStepFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const { form, nextStep, prevStep } =
    useMultiStepFormContext<typeof MarketingCampaignFormSchema>();

  return (
    <Form {...form}>
      <div className="flex gap-4 relative">
        <div className={"flex flex-col gap-4 max-w-xl w-full"}>
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
            <MessageTemplateFormV2
              prefix="template.messageTemplate"
              initialValue={selectedTemplate.content!}
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
        <div className="w-full sticky top-4">
          {selectedTemplate?.content && (
            <SingleTemplatePreview template={selectedTemplate?.content} />
          )}
        </div>
      </div>
    </Form>
  );
}

export default TemplateStep;
