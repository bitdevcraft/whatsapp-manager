/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Template } from "@workspace/db/schema";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { PhoneInput } from "@workspace/ui/components/phone-input";
import { Progress } from "@workspace/ui/components/progress";
import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { TemplateResponse } from "@workspace/wa-cloud-api";
import axios from "axios";
import {
  Calendar,
  Check,
  LoaderCircle,
  MessageSquare,
  SendHorizontal,
  SquareArrowOutUpRight,
  Tag,
  Trash,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { getMarketingCampaignById } from "@/features/marketing-campaigns/_lib/queries";
import { ComponentsValue } from "@/features/whatsapp/templates/lib/schema";
import { logger } from "@/lib/logger";

import { getEstimatedRecipients, hasRemainingUsage } from "./action";
import { BubbleChatPreview } from "./bubble-chat-preview";
import { handleMergeTemplateMessage } from "./lib";
import { SingleTemplatePreview } from "./template-preview";

interface Props {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getMarketingCampaignById>>,
      Awaited<ReturnType<typeof getEstimatedRecipients>>,
      Awaited<ReturnType<typeof hasRemainingUsage>>,
    ]
  >;
}

export default function MarketingCampaignDashboard({ promises }: Props) {
  const { id } = useParams();

  const [openPreview, setOpenPreview] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<string>("overview");

  const [
    {
      contacts,
      data,
      engagement,
      messageSent,
      openRate,
      replyRate,
      totalRecipients,
    },
    estRecipients,
    remainingUsage,
  ] = React.use(promises);

  if (data && data.template.content && data.messageTemplate)
    handleMergeTemplateMessage(data.template.content, data.messageTemplate);

  const sendMarketingCampaign = async () => {
    try {
      const response = await axios.post(
        `/api/whatsapp/marketing-campaigns/${id}/send`,
        data
      );

      logger.log(response);
      toast.success("Marketing Campaign Sent is now processing", {
        description: "Successful",
      });
    } catch (error: any) {
      toast.error("Unsuccessful", {
        description: `Please reach out the admin with this issue: ${error.message}`,
      });
    }
  };

  const useSendPreview = () => {
    return useMutation({
      mutationFn: async (payload: PreviewPhoneMessageValue) => {
        const response = await axios.post(
          `/api/whatsapp/marketing-campaigns/${data?.id}/test-preview`,
          payload
        );

        setOpenPreview(false);
        return response.data;
      },
    });
  };

  const sendPreview = useSendPreview();

  const onSubmit: SubmitHandler<PreviewPhoneMessageValue> = (data) => {
    sendPreview.mutate(data, {
      onError: () => {
        toast.error("Error");
      },
      onSuccess: () => {
        toast.success("Preview Sent");
      },
    });
  };

  return (
    <>
      <ResponsiveDialog
        isOpen={openPreview}
        setIsOpen={setOpenPreview}
        title={"Send Campaign Preview"}
      >
        <PreviewForm onSubmit={onSubmit} pending={sendPreview.isPending} />
      </ResponsiveDialog>

      {/* Header Section */}
      <section className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6 md:p-8 grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex gap-2 items-center flex-wrap">
                <Badge
                  className="capitalize"
                  variant={
                    data?.status === "sent"
                      ? "default"
                      : data?.status === "draft"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {data?.status}
                </Badge>
                <p className="text-muted-foreground text-sm">
                  Created on&nbsp;
                  {data?.createdAt &&
                    new Date(data?.createdAt).toLocaleDateString()}
                </p>
              </div>
              <h1 className="font-bold text-2xl">{data?.name}</h1>
            </div>
            <div className="flex justify-end gap-2 items-start">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      className="bg-green-600 text-white font-semibold hover:bg-green-700"
                      disabled={
                        (data?.status !== "draft" &&
                          data?.status !== "pending") ||
                        !remainingUsage.success
                      }
                      onClick={sendMarketingCampaign}
                      size="sm"
                    >
                      <SendHorizontal className="mr-2 h-4 w-4" />
                      Send Campaign
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{remainingUsage.message ?? "Send Now"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      disabled={!remainingUsage.success}
                      onClick={() => setOpenPreview(true)}
                      size="sm"
                      variant="outline"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Test Preview
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {remainingUsage.message ??
                      "Send to Internal Contact to test"}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Button
                disabled={
                  data?.status !== "draft" && data?.status !== "pending"
                }
                size="sm"
                variant="outline"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <CampaignAnalytics
            engagement={engagement}
            messageSent={messageSent}
            openRate={openRate}
            replyRate={replyRate}
            status={data?.status}
            totalRecipients={
              data?.status !== "draft" ? totalRecipients : estRecipients
            }
          />
        </div>

        {/* Tabs Navigation */}
        <Tabs
          className="px-6 md:px-8"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">
              <Calendar className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="template">
              <MessageSquare className="h-4 w-4 mr-2" />
              Template Preview
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <Users className="h-4 w-4 mr-2" />
              Contact List
              {contacts && contacts.length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {contacts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Tabs Content */}
      <section className="p-6 md:p-8">
        <Tabs onValueChange={setActiveTab} value={activeTab}>
          <TabsContent className="mt-0 space-y-6" value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeliveryStatus
                messageSent={messageSent}
                totalRecipients={totalRecipients}
              />
              <CampaignDetails
                contacts={contacts}
                schedule={data?.scheduleAt}
                tags={data?.tags}
              />
            </div>
          </TabsContent>

          <TabsContent className="mt-0" value="template">
            {data && data.template.content && data.messageTemplate ? (
              <CampaignTemplatePreview
                messageTemplate={data.messageTemplate}
                template={data.template.content}
                templateName={data.template.name}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No template available
              </div>
            )}
          </TabsContent>

          <TabsContent className="mt-0" value="contacts">
            {contacts && contacts.length > 0 ? (
              <ContactListTable contacts={contacts} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No contacts available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}

function CampaignAnalytics({
  engagement,
  messageSent,
  openRate,
  replyRate,
  status,
  totalRecipients,
}: {
  engagement: number;
  messageSent: number;
  openRate: number;
  replyRate: number;
  status?: null | string;
  totalRecipients: number;
}) {
  const stats = [
    {
      description: "Total Number of contacts",
      icon: Users,
      label: status === "draft" ? "Est. Recipients" : "Total Recipients",
      value: totalRecipients.toString(),
    },
    {
      description: "Total messages dispatched",
      icon: SendHorizontal,
      label: "Messages Sent",
      value: messageSent.toString(),
    },
    {
      description: "Messages viewed",
      icon: MessageSquare,
      label: "Open Rate",
      value: `${openRate.toFixed(1)}%`,
    },
    {
      description: "Received responses",
      icon: MessageSquare,
      label: "Replies",
      value: replyRate.toString(),
    },
    {
      description: "Overall engagement",
      icon: Check,
      label: "Engagement",
      value: `${engagement}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          className="min-h-20 bg-card border rounded-xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
          key={stat.label}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <stat.icon size={14} />
            <span className="text-xs font-medium">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function CampaignDetails({
  contacts,
  schedule,
  tags,
}: {
  contacts: null | { id: string; name: string; phone: string }[];
  schedule?: Date | null;
  tags?: null | string[];
}) {
  return (
    <div className="rounded-lg border bg-card p-6 flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Campaign Details</h3>

      {tags && tags.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Tags</p>
          <div className="flex gap-2 flex-wrap">
            {tags?.map((el, i) => (
              <Badge key={i} variant="secondary">
                {el}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {schedule && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Schedule</p>
          <div className="flex gap-2 items-center">
            <Calendar className="text-muted-foreground" size={16} />
            <p className="text-sm">
              {new Date(schedule).toLocaleDateString()} at&nbsp;
              {new Date(schedule).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {contacts && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Recipients</p>
          <p className="text-sm font-medium">{contacts.length} contacts</p>
        </div>
      )}
    </div>
  );
}

function CampaignTemplatePreview({
  messageTemplate,
  template,
  templateLanguage = "",
  templateName = "",
}: {
  messageTemplate: { components?: ComponentsValue[] };
  template: TemplateResponse;
  templateLanguage?: string;
  templateName?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Template Info Card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Template Information</h3>
          <Badge variant="outline">{templateLanguage.toUpperCase()}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Template Name</p>
            <p className="font-medium">{templateName}</p>
          </div>
        </div>
      </div>

      {/* Phone Preview Card */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Message Preview</h3>
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-muted/50 rounded-2xl p-6 shadow-sm">
            <BubbleChatPreview
              messageTemplate={messageTemplate}
              template={template}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactListTable({
  contacts,
}: {
  contacts: { id: string; name: string; phone: string }[];
}) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">
          Contact List ({contacts.length})
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          All recipients who will receive this campaign
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                Name
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                Phone Number
              </th>
              <th className="text-right p-4 font-medium text-sm text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => (
              <tr
                className={index !== contacts.length - 1 ? "border-b" : ""}
                key={contact.id}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{contact.name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{contact.phone}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/ing/whatsapp/conversations?contact=${contact.id}`}
                      target="_blank"
                    >
                      <Button size="sm" variant="outline">
                        <SquareArrowOutUpRight className="mr-2" size={14} />
                        View Chat
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeliveryStatus({
  messageSent,
  totalRecipients,
}: {
  messageSent: number;
  totalRecipients: number;
}) {
  const deliveredPercent =
    totalRecipients > 0 ? (messageSent / totalRecipients) * 100 : 0;
  const failedPercent =
    totalRecipients > 0
      ? ((totalRecipients - messageSent) / totalRecipients) * 100
      : 0;

  return (
    <div className="rounded-lg border bg-card p-6 grid gap-6">
      <h3 className="text-lg font-semibold">Delivery Status</h3>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-green-600" strokeWidth={3} />
            </div>
            <span className="text-sm font-medium">Delivered</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {messageSent} / {totalRecipients}
          </span>
        </div>
        <Progress className="h-2" value={deliveredPercent} />
        <p className="text-xs text-muted-foreground text-right">
          {deliveredPercent.toFixed(1)}%
        </p>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <X className="h-3.5 w-3.5 text-red-600" strokeWidth={3} />
            </div>
            <span className="text-sm font-medium">Failed</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {totalRecipients - messageSent} / {totalRecipients}
          </span>
        </div>
        <Progress className="h-2" value={failedPercent} />
        <p className="text-xs text-muted-foreground text-right">
          {failedPercent.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

const PreviewPhoneMessageSchema = z.object({
  phone: z.string(),
});

type PreviewPhoneMessageValue = z.infer<typeof PreviewPhoneMessageSchema>;

export function PreviewForm({
  onSubmit,
  pending = false,
}: {
  onSubmit: (data: PreviewPhoneMessageValue) => void;
  pending?: boolean;
}) {
  const form = useForm<PreviewPhoneMessageValue>({
    defaultValues: {
      phone: "",
    },
    resolver: zodResolver(PreviewPhoneMessageSchema),
  });

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex gap-4 justify-center">
          <FormField
            name={`phone`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl className="flex-1">
                  <PhoneInput
                    placeholder="+971 50 XXX XXXX"
                    {...field}
                    className="w-full"
                    defaultCountry="AE"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {pending ? (
            <Button disabled size={"icon"}>
              <LoaderCircle className="animate-spin" />
            </Button>
          ) : (
            <Button size={"icon"} type="submit">
              <SendHorizontal />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground font-light text-sm">
          <span className="font-bold text-danger">Note:</span>&nbsp;Please note
          that you can only receive 1 message campaign per 24 hours. <br />
          <br />
          If you want to receive a new test campaign, reply to the conversation
          first to open the&nbsp;
          <span className="font-semibold">WhatsApp 24hr Window Rule</span>
        </p>
      </form>
    </Form>
  );
}
