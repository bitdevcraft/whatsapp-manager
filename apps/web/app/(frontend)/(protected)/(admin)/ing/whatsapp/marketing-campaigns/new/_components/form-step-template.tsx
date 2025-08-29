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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useWatch } from "react-hook-form";

import { useMultiStepFormContext } from "@/components/forms/multi-step-form";
import { MarketingCampaignFormSchema } from "@/features/marketing-campaigns/_lib/schema";

import { BubbleChatPreview } from "../../[id]/bubble-chat-preview";
import { getSelectTemplates } from "./queries";
import { useTemplateStore } from "./store";
import { MessageTemplateFormV2 } from "./template-form/message-template-form";

interface TemplateStepFormProps {
  templates: Awaited<ReturnType<typeof getSelectTemplates>>;
}

function TemplateStep({ templates }: TemplateStepFormProps) {
  const { setTemplate, template } = useTemplateStore();

  const { form, nextStep, prevStep } =
    useMultiStepFormContext<typeof MarketingCampaignFormSchema>();

  const message = useWatch({
    control: form.control,
    name: "template.messageTemplate",
  });

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
                      setTemplate(match ?? null);
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

          {template && (
            <MessageTemplateFormV2
              initialValue={template.content!}
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
          {template?.content && (
            <BubbleChatPreview
              messageTemplate={message}
              template={template?.content}
            />
          )}
        </div>
      </div>
    </Form>
  );
}

export default TemplateStep;
