"use client";

import { useTitle } from "@/components/provider/title-provider";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { MarketingCampaign, Template } from "@workspace/db/schema";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import {
  Calendar,
  Check,
  Send,
  SendHorizontal,
  Tag,
  Trash,
  X,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export default function Home() {
  const setTitle = useTitle();

  const { id } = useParams();

  const [data, setData] = useState<
    MarketingCampaign & { template: Template }
  >();

  const fetchData = async () => {
    const response = await axios.get(`/api/whatsapp/marketing-campaigns/${id}`);
    console.log(response.data.data);
    setData(response.data.data);
  };

  useEffect(() => {
    setTitle("Marketing Campaigns");
    fetchData();
  }, [setTitle]);

  return (
    <section className="p-8 grid gap-4">
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
      <CampaignAnalytics />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DeliveryStatus />
        <CampaignDetails tags={data?.tags} schedule={data?.scheduleAt} />
      </div>
      <CampaignTemplatePreview />
    </section>
  );
}

function CampaignTemplatePreview() {
  return (
    <div className="min-h-16 border rounded p-4 flex flex-col gap-4">
      <h3 className="text-secondary-foreground text-sm font-semibold">
        Template Preview
      </h3>
      <div className="min-h-16 bg-muted rounded-sm"></div>
    </div>
  );
}

function DeliveryStatus() {
  return (
    <div className="rounded border p-4 grid gap-4">
      <h3 className="text-secondary-foreground text-sm font-semibold">
        Delivery Status
      </h3>
      <div className="grid gap-2">
        <div className="flex gap-2">
          <Check size={15} color="green" strokeWidth={3} />
          <p className="text-xs font-light">Delivered</p>
        </div>
        <Progress value={0} />
      </div>
      <div className="grid gap-2">
        <div className="flex gap-2">
          <X size={15} color="red" strokeWidth={3} />
          <p className="text-xs font-light">Failed</p>
        </div>
        <Progress value={0} />
      </div>
    </div>
  );
}

function CampaignDetails({
  tags,
  schedule,
}: {
  tags?: string[] | null;
  schedule?: Date | null;
}) {
  return (
    <div className="rounded border p-4 flex flex-col gap-4">
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
    </div>
  );
}

function CampaignAnalytics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="min-h-16 border rounded flex flex-col p-4 gap-2">
        <h3 className="text-muted-foreground ">Total Recipients</h3>
        <p className="text-3xl font-semibold">0</p>
        <p className="text-xs font-light text-muted-foreground">
          Total Number of contacts
        </p>
      </div>
      <div className="min-h-16 border rounded flex flex-col p-4 gap-2">
        <h3 className="text-muted-foreground ">Messages Sent</h3>
        <p className="text-3xl font-semibold">0</p>
        <p className="text-xs font-light text-muted-foreground">
          Total messages dispatched
        </p>
      </div>
      <div className="min-h-16 border rounded flex flex-col p-4 gap-2">
        <h3 className="text-muted-foreground ">Open Rate</h3>
        <p className="text-3xl font-semibold">
          0 <span className="text-xl font-light text-muted-foreground">%</span>
        </p>
        <p className="text-xs font-light text-muted-foreground">
          Messages viewed
        </p>
      </div>
      <div className="min-h-16 border rounded flex flex-col p-4 gap-2">
        <h3 className="text-muted-foreground ">Reply Rate</h3>
        <p className="text-3xl font-semibold">
          0 <span className="text-xl font-light text-muted-foreground">%</span>
        </p>
        <p className="text-xs font-light text-muted-foreground">
          Received responses
        </p>
      </div>
      <div className="min-h-16 border rounded flex flex-col p-4 gap-2">
        <h3 className="text-muted-foreground ">Engagement</h3>
        <p className="text-3xl font-semibold">
          0 <span className="text-xl font-light text-muted-foreground">%</span>
        </p>
        <p className="text-xs font-light text-muted-foreground">
          Overall engagement
        </p>
      </div>
    </div>
  );
}
