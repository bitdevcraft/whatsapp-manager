/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Contact, Template } from "@workspace/db/schema";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { LanguagesEnum } from "@workspace/wa-cloud-api";
import axios from "axios";
import { SendHorizonal } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  MultiStepForm,
  MultiStepFormStep,
} from "@/components/forms/multi-step-form";
import { MessageTemplateForm } from "@/features/whatsapp/templates/forms/message-template";
import { transformTemplateResponseToFormValues } from "@/features/whatsapp/templates/forms/message-template-actions";
import {
  templateSendSchema,
  TemplateSendValue,
} from "@/types/validations/templates/template-send-schema";

import { getSelectTemplates } from "../../marketing-campaigns/new/_components/queries";
import { useSearchMessageStore } from "../_store/message-store";

const FormSchema = z.object({
  text: z.string().nonempty("Message should not be empty"),
});

export interface Props {
  contact: Contact;
  lastMessageDate?: Date;
  templates: Awaited<ReturnType<typeof getSelectTemplates>>;
}

type FormValues = z.infer<typeof FormSchema>;
export default function ConversationMessage({
  contact,
  lastMessageDate,
  templates,
}: Props) {
  const queryClient = useQueryClient();

  const { clearSearchMessageId, clearSearchString, updateRandomId } =
    useSearchMessageStore();

  const form = useForm<FormValues>({
    defaultValues: {
      text: "",
    },
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (input: FormValues) => {
    try {
      await axios.post("/api/whatsapp/conversations", {
        contactId: contact.id,
        text: input.text,
      });

      updateRandomId();
      clearSearchMessageId();
      clearSearchString();

      form.reset();

      queryClient.invalidateQueries({
        queryKey: ["conversations", contact.id], // prefix
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error Sending");
    }
  };

  const [templateDialog, setTemplateDialog] = React.useState<boolean>(false);

  if (
    !lastMessageDate ||
    (lastMessageDate && !isWithinLast24Hours(lastMessageDate))
  ) {
    return (
      <div className="w-full">
        <ResponsiveDialog
          isOpen={templateDialog}
          setIsOpen={setTemplateDialog}
          title={"Message Template"}
        >
          <TemplateMessage
            contact={contact}
            setIsOpen={setTemplateDialog}
            templates={templates}
          />
        </ResponsiveDialog>
        <div className="flex gap-2 w-full">
          <Textarea
            className="flex-1"
            disabled
            placeholder="24-hr window time is done. Please send a message using a template"
          />

          <Button onClick={() => setTemplateDialog(true)}>
            Send Template
            <SendHorizonal />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className="bg-background flex gap-2 w-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          name="text"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea {...field} placeholder="Message" rows={1} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button size="icon" type="submit">
          <SendHorizonal />
        </Button>
      </form>
    </Form>
  );
}

function isWithinLast24Hours(createdAt: Date | string): boolean {
  const created =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const now = Date.now();
  const diffMs = now - created.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  return diffMs >= 0 && diffMs <= oneDayMs;
}

function TemplateMessage({
  contact,
  setIsOpen,
  templates,
}: {
  contact: Contact;
  setIsOpen: (state: boolean) => void;
  templates: Awaited<ReturnType<typeof getSelectTemplates>>;
}) {
  const queryClient = useQueryClient();

  const form = useForm<TemplateSendValue>({
    defaultValues: {
      contactId: contact.id,
      phone: contact.phone,
      template: {
        messageTemplate: {
          components: [],
          language: {
            code: LanguagesEnum.English,
            policy: "deterministic",
          },
          name: "",
        },
        template: "",
      },
      templateId: "",
    },
    resolver: zodResolver(templateSendSchema),
  });

  const [selectedTemplate, setSelectedTemplate] =
    React.useState<null | Template>(null);

  const defaultMessageTemplate = React.useMemo(() => {
    return selectedTemplate
      ? transformTemplateResponseToFormValues(selectedTemplate.content!)
      : undefined;
  }, [selectedTemplate]);

  // Patch messageTemplate values when template changes
  React.useEffect(() => {
    if (defaultMessageTemplate) {
      form.setValue("template.messageTemplate", defaultMessageTemplate);
    }
    const templateId = form.getValues().template.template;

    if (templateId) {
      const match = templates.templates.find((t: any) => t.id === templateId);
      setSelectedTemplate(match ?? null);
    }
  }, [defaultMessageTemplate, form, templates.templates]);

  const { setSearchMessageId } = useSearchMessageStore();

  const onSubmit = async (data: TemplateSendValue) => {
    try {
      await axios.post("/api/whatsapp/conversations/send-template", {
        ...data,
        templateId: selectedTemplate?.id,
      });

      toast.success("Sent");
    } catch (error: any) {
      toast.error(`Error : ${error.message}`);
    }

    setIsOpen(false);
    setSearchMessageId("");

    queryClient.invalidateQueries({
      queryKey: ["conversations", contact.id], // prefix
    });
  };

  return (
    <div>
      <MultiStepForm
        className={"space-y-10"}
        form={form}
        onSubmit={onSubmit}
        schema={templateSendSchema}
      >
        <MultiStepFormStep name="templates">
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
                  initialTemplate={selectedTemplate.content!}
                  namePrefix="template.messageTemplate"
                  preview
                />
              )}

              <div className="flex justify-end gap-2">
                <Button type="submit" variant="outline">
                  Send
                </Button>
              </div>
            </div>
          </Form>
        </MultiStepFormStep>
      </MultiStepForm>
    </div>
  );
}
