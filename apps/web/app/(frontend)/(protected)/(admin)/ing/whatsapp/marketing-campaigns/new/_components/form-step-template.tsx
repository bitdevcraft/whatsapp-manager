"use client";

import { Template } from "@workspace/db/schema/templates";
import { Button } from "@workspace/ui/components/button";
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
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

import { useMultiStepFormContext } from "@/components/forms/multi-step-form";
import { MarketingCampaignFormSchema } from "@/features/marketing-campaigns/_lib/schema";

import { SingleTemplatePreview } from "../../[id]/template-preview";
import { getSelectTemplates } from "./queries";
import { MessageTemplateFormV2 } from "./template-form/message-template-form";

interface TemplateStepFormProps {
  templates: Awaited<ReturnType<typeof getSelectTemplates>>;
}

function TemplateStep({ templates }: TemplateStepFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<null | Template>(
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
              onClick={prevStep}
              size="icon"
              type="button"
              variant="outline"
            >
              <ArrowLeft />
            </Button>
            <Button
              onClick={nextStep}
              size="icon"
              type="button"
              variant="outline"
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
              initialValue={selectedTemplate.content!}
              prefix="template.messageTemplate"
              preview
            />
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={prevStep} type="button" variant="outline">
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
