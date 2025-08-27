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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import axios from "axios";
import {
  Calendar,
  Check,
  LoaderCircle,
  SendHorizontal,
  SquareArrowOutUpRight,
  Tag,
  Trash,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { getMarketingCampaignById } from "@/features/marketing-campaigns/_lib/queries";
import { logger } from "@/lib/logger";

import { getEstimatedRecipients, hasRemainingUsage } from "./action";
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
      <section className="p-8 grid gap-4 ">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex gap-2 items-center">
            <Badge variant="outline">{data?.status}</Badge>
            <p className="text-muted-foreground text-sm">
              Created on&nbsp;
              {data?.createdAt && new Date(data?.createdAt).toDateString()}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    className="bg-green-600 text-white font-semibold text-sm"
                    disabled={
                      (data?.status !== "draft" &&
                        data?.status !== "pending") ||
                      !remainingUsage.success
                    }
                    onClick={sendMarketingCampaign}
                    size="sm"
                    variant="outline"
                  >
                    <SendHorizontal />
                    Send
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
                    Preview
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {remainingUsage.message ?? "Send to Internal Contact to test"}
                </p>
              </TooltipContent>
            </Tooltip>
            <Button
              disabled={data?.status !== "draft" && data?.status !== "pending"}
              size="sm"
              variant="destructive"
            >
              <Trash />
            </Button>
          </div>
        </div>
        <h1 className="font-semibold text-lg">{data?.name}</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <CampaignTemplatePreview template={data?.template} />
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="min-h-16 bg-background border rounded flex flex-col p-4 gap-2">
        <h3 className="text-muted-foreground ">
          {status === "draft" && "Est. "}Total Recipients
        </h3>

        <p className="text-3xl font-semibold">{totalRecipients}</p>
        <p className="text-xs font-light text-muted-foreground">
          Total Number of contacts
        </p>
      </div>
      <div className="min-h-16 bg-background border rounded flex flex-col p-4 gap-2">
        <h3 className="text-muted-foreground ">Messages Sent</h3>
        <p className="text-3xl font-semibold">{messageSent}</p>
        <p className="text-xs font-light text-muted-foreground">
          Total messages dispatched
        </p>
      </div>
      <div className="min-h-16 bg-background border rounded flex flex-col p-4 gap-2">
        <h3 className="text-muted-foreground ">Open Rate</h3>
        <p className="text-3xl font-semibold">
          {openRate.toFixed(2)}&nbsp;
          <span className="text-xl font-light text-muted-foreground">%</span>
        </p>
        <p className="text-xs font-light text-muted-foreground">
          Messages viewed
        </p>
      </div>
      <div className="min-h-16 bg-background border rounded flex flex-col p-4 gap-2">
        <h3 className="text-muted-foreground ">Reply </h3>
        <p className="text-3xl font-semibold">{replyRate}&nbsp;</p>
        <p className="text-xs font-light text-muted-foreground">
          Received responses
        </p>
      </div>
      <div className="min-h-16 bg-background border rounded flex flex-col p-4 gap-2">
        <h3 className="text-muted-foreground ">Engagement</h3>
        <p className="text-3xl font-semibold">
          {engagement}&nbsp;
          <span className="text-xl font-light text-muted-foreground">%</span>
        </p>
        <p className="text-xs font-light text-muted-foreground">
          Overall engagement
        </p>
      </div>
    </div>
  );
}

function CampaignDetails({
  contacts,
  schedule,
  tags,
}: {
  contacts: null | { id: string; name: string; phone: string; }[];
  schedule?: Date | null;
  tags?: null | string[];
}) {
  return (
    <div className="rounded border p-4 flex flex-col gap-4 bg-background">
      <h3 className="text-secondary-foreground text-sm font-semibold">
        Campaign Details
      </h3>
      <div className="flex gap-2 flex-wrap justify-start items-center">
        <Tag size={15} />
        {tags?.map((el, i) => (
          <Badge key={i} variant="outline">
            {el}
          </Badge>
        ))}
      </div>
      {schedule && (
        <div className="flex gap-2 flex-wrap justify-start items-center">
          <Calendar size={15} />
          <p className="text-sm text-muted-foreground pl-2">
            Scheduled at:&nbsp;
            {schedule && new Date(schedule).toDateString()}&nbsp;
            {schedule && new Date(schedule).toLocaleTimeString()}
          </p>
        </div>
      )}
      {contacts && (
        <div className="w-full">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                Contacts
              </Button>
            </DialogTrigger>
            <DialogContent className="w-72">
              <DialogHeader className="grid gap-4">
                <DialogTitle>Contacts</DialogTitle>
                <DialogDescription>
                  <ScrollArea className="h-72 rounded-md border">
                    <div className="p-4">
                      {contacts.map((el, i) => (
                        <React.Fragment key={i}>
                          <Link
                            className="flex items-center justify-between"
                            href={`/ing/whatsapp/conversations?contact=${el.id}`}
                            target="_blank"
                          >
                            {el.name}
                            <SquareArrowOutUpRight size={15} />
                          </Link>
                          <Separator className="my-2" />
                        </React.Fragment>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

function CampaignTemplatePreview({ template }: { template?: Template }) {
  if (!template?.content) return null;

  return (
    <div className="min-h-16 bg-background border rounded p-4 flex flex-col gap-4">
      <h3 className="text-secondary-foreground text-sm font-semibold">
        Template Preview
      </h3>
      <div className="min-h-16 ">
        <SingleTemplatePreview template={template.content} />
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
  return (
    <div className="rounded border p-4 grid gap-4 bg-background">
      <h3 className="text-secondary-foreground text-sm font-semibold">
        Delivery Status
      </h3>
      <div className="grid gap-2">
        <div className="flex gap-2">
          <Check color="green" size={15} strokeWidth={3} />
          <p className="text-xs font-light">Delivered</p>
        </div>
        <Progress value={(messageSent / totalRecipients) * 100} />
      </div>
      <div className="grid gap-2">
        <div className="flex gap-2">
          <X color="red" size={15} strokeWidth={3} />
          <p className="text-xs font-light">Failed</p>
        </div>
        <Progress
          value={((totalRecipients - messageSent) / totalRecipients) * 100}
        />
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
