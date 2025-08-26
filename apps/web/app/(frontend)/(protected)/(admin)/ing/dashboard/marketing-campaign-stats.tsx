"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import React from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import { getDashboardAnalytics } from "@/features/dashboard/_lib/queries";

export interface Props {
  promises: Promise<[Awaited<ReturnType<typeof getDashboardAnalytics>>]>;
}

export const description = "A horizontal bar chart";
const chartData = [
  { count: 0, fill: "var(--color-success)", status: "success" },
  { count: 0, fill: "var(--color-pending)", status: "pending" },
  { count: 0, fill: "var(--color-failed)", status: "failed" },
  { count: 0, fill: "var(--color-disabled)", status: "disabled" },
  { count: 0, fill: "var(--color-draft)", status: "draft" },
  { count: 0, fill: "var(--color-processing)", status: "processing" },
];

const chartConfig = {
  disabled: {
    color: "var(--muted)",
    label: "Disabled",
  },
  draft: {
    color: "var(--muted-foreground)",
    label: "Draft",
  },
  failed: {
    color: "var(--color-red-400)",
    label: "Failed",
  },
  pending: {
    color: "var(--color-blue-300)",
    label: "Pending",
  },
  processing: {
    color: "var(--color-blue-500)",
    label: "Processing",
  },
  success: {
    color: "var(--color-green-400)",
    label: "Success",
  },
} satisfies ChartConfig;

export default function MarketingCampaignStats({ promises }: Props) {
  const [{ marketingCampaignStatus }] = React.use(promises);

  // 3. turn it into a lookup map
  const realCountByStatus = new Map(
    marketingCampaignStatus.map(({ count, status }) => [status, count] as const)
  );

  // 4. merge!
  const merged = chartData.map((item) => ({
    ...item,
    // if we have a real count for this status, use it, otherwise keep the default
    count: realCountByStatus.has(item.status)
      ? realCountByStatus.get(item.status)!
      : item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing Campaign</CardTitle>
        <CardDescription>Status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={merged}
            layout="vertical"
            margin={{
              left: 20,
            }}
          >
            <XAxis dataKey="count" hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="status"
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
              tickLine={true}
              tickMargin={10}
              type="category"
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
            />
            <Bar dataKey="count" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Showing total status counts of Marketing Campaigns
        </div>
      </CardFooter>
    </Card>
  );
}
