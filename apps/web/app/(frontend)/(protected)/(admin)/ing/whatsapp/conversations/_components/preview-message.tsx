"use client";

import { ConversationBody, User } from "@workspace/db";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import React from "react";

import { UniversalPreviewBlob } from "@/components/universal-preview-blob";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";

export function PreviewMessage({
  className,
  date,
  input,
  user,
  ...props
}: React.ComponentProps<"div"> & {
  date: Date;
  input: ConversationBody;
  user?: null | User;
}) {
  return (
    <Card
      className={cn(
        "border rounded max-w-sm text-wrap bg-card text-card-foreground grid gap-2",
        className,
        input.body?.media?.id ? "pt-0" : ""
      )}
      {...props}
    >
      {input.body?.media?.id && (
        <CardHeader className="w-72 p-0">
          <UniversalPreviewBlob
            allowDownload
            modalOnClick
            src={`/api/whatsapp/files?mediaId=${input.body?.media?.id}`} // replace with your endpoint
          />
        </CardHeader>
      )}
      {input.header?.text && <CardHeader>{input.header?.text}</CardHeader>}
      <CardContent>{input.body?.text}</CardContent>
      <CardFooter className="text-sm font-light">{input.footer}</CardFooter>
      {input.buttons && input.buttons?.length > 0 && (
        <div className="flex flex-col items-center gap-4">
          {input.buttons?.map((el, i) => (
            <div key={i}>
              <button className="bg-accent text-accent-foreground text-sm hover:bg-accent/80">
                {el.text}
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
