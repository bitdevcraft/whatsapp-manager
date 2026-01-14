/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Contact, Conversation, Template } from "@workspace/db/schema";
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
import { Paperclip, SendHorizonal } from "lucide-react";
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
import { MessagesTemplateFormV2 } from "../../marketing-campaigns/new/_components/template-form/message-template-form";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { useTemplateStore } from "../../marketing-campaigns/new/_components/store";
import { DevTool } from "@hookform/devtools";
import { cn } from "@workspace/ui/lib/utils";

const FormSchema = z.object({
  text: z.string().min(1, "Message should not be empty"),
});

export interface Props {
  contact: Contact;
  conversation?: Conversation;
  lastMessageDate?: Date;
  templates: Awaited<ReturnType<typeof getSelectTemplates>>;
  onTypingChange?: (isTyping: boolean) => void;
}

type FormValues = z.infer<typeof FormSchema>;

export default function ConversationMessage({
  contact,
  conversation,
  lastMessageDate,
  templates,
  onTypingChange,
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

  const messageText = form.watch("text");

  // Handle typing indicator
  React.useEffect(() => {
    if (!onTypingChange) return;

    const timeout = setTimeout(() => {
      onTypingChange(!!messageText);
    }, 300);

    return () => clearTimeout(timeout);
  }, [messageText, onTypingChange]);

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
        queryKey: ["conversations", contact.id],
      });
    } catch (error) {
      toast.error("Error Sending");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (messageText.trim()) {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  const [templateDialog, setTemplateDialog] = React.useState<boolean>(false);

  if (
    !lastMessageDate ||
    (lastMessageDate && !isWithinLast24Hours(lastMessageDate))
  ) {
    return (
      <div className="w-full bg-background border-t p-3">
        <ResponsiveDialog
          isOpen={templateDialog}
          setIsOpen={setTemplateDialog}
          title={"Message Template"}
        >
          <TemplateMessage
            contact={contact}
            conversation={conversation}
            setIsOpen={setTemplateDialog}
            templates={templates}
          />
        </ResponsiveDialog>
        <div className="flex gap-2 w-full items-end">
          <Textarea
            className="flex-1 resize-none"
            disabled
            placeholder="24-hr window time is done. Please send a message using a template"
            rows={1}
          />
          <Button
            onClick={() => setTemplateDialog(true)}
            variant="default"
          >
            Send Template
            <SendHorizonal className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background border-t p-3">
      <Form {...form}>
        <form
          className="flex gap-2 w-full items-end"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Button
            size="icon"
            type="button"
            variant="ghost"
            className="flex-shrink-0"
          >
            <Paperclip className="size-5" />
          </Button>

          <FormField
            name="text"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    className="resize-none min-h-[40px] max-h-32 py-2"
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            size="icon"
            type="submit"
            variant={messageText.trim() ? "default" : "ghost"}
            disabled={!messageText.trim()}
            className={cn(
              "flex-shrink-0 transition-all",
              messageText.trim() && "shadow-md"
            )}
          >
            <SendHorizonal className="size-5" />
          </Button>
        </form>
      </Form>
    </div>
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
  conversation,
  setIsOpen,
  templates,
}: {
  contact: Contact;
  conversation?: Conversation;
  setIsOpen: (state: boolean) => void;
  templates: Awaited<ReturnType<typeof getSelectTemplates>>;
}) {
  const queryClient = useQueryClient();

  const phoneNumber =
    conversation &&
    // @ts-expect-error content
    "phoneNumberId" in conversation.content &&
    conversation.content.phoneNumberId
      ? (conversation.content.phoneNumberId as string)
      : "";

  const form = useForm<TemplateSendValue>({
    defaultValues: {
      contactId: contact.id,
      details: {
        phoneNumber,
      },
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

  const { setTemplate, template } = useTemplateStore();

  // Patch messageTemplate values when template changes
  React.useEffect(() => {
    const templateId = form.getValues().template.template;

    if (templateId) {
      const match = templates.templates.find((t: any) => t.id === templateId);
      setTemplate(match ?? null);
    }
  }, [form, setTemplate, templates.templates]);

  const { setSearchMessageId } = useSearchMessageStore();

  const onSubmit = async (data: TemplateSendValue) => {
    try {
      await axios.post("/api/whatsapp/conversations/send-template", {
        ...data,
        templateId: template?.id,
      });

      toast.success("Sent");
    } catch (error: any) {
      toast.error(`Error : ${error.message}`);
    }

    setIsOpen(false);
    setSearchMessageId("");

    queryClient.invalidateQueries({
      queryKey: ["conversations", contact.id],
    });
  };

  if (!phoneNumber || phoneNumber === "")
    return (
      <p className="text-sm font-light">
        You can&apos;t message the contact personally, contact should message
        first before proceeding
      </p>
    );

  return (
    <div>
      <Form {...form}>
        <form
          className={"flex flex-col gap-4"}
          onSubmit={form.handleSubmit(onSubmit)}
        >
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

          {template?.content && (
            <ScrollArea className="h-[70vh]">
              <MessagesTemplateFormV2
                initialValue={template.content}
                key={template.id}
                prefix="template.messageTemplate"
                preview
              />
            </ScrollArea>
          )}

          <div className="flex justify-end gap-2">
            <Button
              disabled={!phoneNumber || phoneNumber === ""}
              type="submit"
              variant="outline"
            >
              Send
            </Button>
          </div>
        </form>
      </Form>
      <DevTool control={form.control} />
    </div>
  );
}
