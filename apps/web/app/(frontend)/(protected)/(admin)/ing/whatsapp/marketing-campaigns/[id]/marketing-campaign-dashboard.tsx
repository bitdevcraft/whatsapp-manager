/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Template } from "@workspace/db/schema";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import {
  Calendar,
  Check,
  SendHorizontal,
  SquareArrowOutUpRight,
  Tag,
  Trash,
  X,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { getMarketingCampaignById } from "@/features/marketing-campaigns/_lib/queries";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import Link from "next/link";
import { SingleTemplatePreview } from "./template-preview";

interface Props {
  promises: Promise<[Awaited<ReturnType<typeof getMarketingCampaignById>>]>;
}

export default function MarketingCampaignDashboard({ promises }: Props) {
  const { id } = useParams();

  const [
    {
      data,
      messageSent,
      totalRecipients,
      openRate,
      replyRate,
      engagement,
      contacts,
    },
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

  return (
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
          <Button
            size="sm"
            variant="outline"
            className="bg-green-600 text-white font-semibold text-sm"
            disabled={data?.status !== "draft" && data?.status !== "pending"}
            onClick={sendMarketingCampaign}
          >
            <SendHorizontal />
            Send
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={data?.status !== "draft" && data?.status !== "pending"}
          >
            <Trash />
          </Button>
        </div>
      </div>
      <h1 className="font-semibold text-lg">{data?.name}</h1>
      <CampaignAnalytics
        messageSent={messageSent}
        totalRecipients={totalRecipients}
        openRate={openRate}
        replyRate={replyRate}
        engagement={engagement}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DeliveryStatus
          messageSent={messageSent}
          totalRecipients={totalRecipients}
        />
        <CampaignDetails
          tags={data?.tags}
          schedule={data?.scheduleAt}
          contacts={contacts}
        />
      </div>
      <CampaignTemplatePreview template={data?.template} />
    </section>
  );
}

function CampaignTemplatePreview({ template }: { template?: Template }) {
  if (!template?.content) return null;

  return (
    <div className="min-h-16 bg-background border rounded p-4 flex flex-col gap-4">
      <h3 className="text-secondary-foreground text-sm font-semibold">
        Template Preview
      </h3>
      <div className="min-h-16 bg-background bg-muted rounded-sm">
        <pre className="p-4 rounded">
          {/* {JSON.stringify(template.content, null, 2)} */}
          <SingleTemplatePreview template={template.content} />
        </pre>
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
          <Check size={15} color="green" strokeWidth={3} />
          <p className="text-xs font-light">Delivered</p>
        </div>
        <Progress value={(messageSent / totalRecipients) * 100} />
      </div>
      <div className="grid gap-2">
        <div className="flex gap-2">
          <X size={15} color="red" strokeWidth={3} />
          <p className="text-xs font-light">Failed</p>
        </div>
        <Progress
          value={((totalRecipients - messageSent) / totalRecipients) * 100}
        />
      </div>
    </div>
  );
}

function CampaignDetails({
  tags,
  schedule,
  contacts,
}: {
  tags?: string[] | null;
  schedule?: Date | null;
  contacts: { name: string; phone: string; id: string }[] | null;
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
                            href={`/ing/whatsapp/conversations?contact=${el.id}`}
                            target="_blank"
                            className="flex items-center justify-between"
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

function CampaignAnalytics({
  messageSent,
  totalRecipients,
  openRate,
  replyRate,
  engagement,
}: {
  messageSent: number;
  totalRecipients: number;
  openRate: number;
  replyRate: number;
  engagement: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="min-h-16 bg-background border rounded flex flex-col p-4 gap-2">
        <h3 className="text-muted-foreground ">Total Recipients</h3>
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
          {openRate}&nbsp;
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
