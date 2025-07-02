"use client";

import { getDashboardAnalytics } from "@/features/dashboard/_lib/queries";
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
import { LabelList, Pie, PieChart } from "recharts";

export interface Props {
  promises: Promise<[Awaited<ReturnType<typeof getDashboardAnalytics>>]>;
}

const chartConfig = {
  delivered: {
    label: "delivered",
    color: "var(--color-green-400)",
  },
  failed: {
    label: "Failed",
    color: "var(--color-red-400)",
  },
} satisfies ChartConfig;

export default function DeliveryStatus({ promises }: Props) {
  const [{ deliveryStatus }] = React.use(promises);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing Campaign Messages</CardTitle>
        <CardDescription>Status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={deliveryStatus} dataKey="value" nameKey="status">
              <LabelList
                dataKey="status"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value: keyof typeof chartConfig) =>
                  chartConfig[value]?.label
                }
              />
            </Pie>
          </PieChart>
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
