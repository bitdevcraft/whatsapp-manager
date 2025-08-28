"use client";

import { ConversationBody, User } from "@workspace/db";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import React from "react";

import { UniversalPreviewBlob } from "@/components/universal-preview-blob";

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
    <div
      className={cn(
        "border rounded max-w-sm text-wrap p-4 text-black bg-[#dcf8c6] grid gap-2",
        className
      )}
      {...props}
    >
      {input.body?.media?.id && (
        <div className="w-72">
          <UniversalPreviewBlob
            allowDownload
            modalOnClick
            src={`/api/whatsapp/files?mediaId=${input.body?.media?.id}`} // replace with your endpoint
          />
        </div>
      )}
      <div>{input.header?.text}</div>
      <div>{input.body?.text}</div>
      <div className="text-sm font-light">{input.footer}</div>
      <div className="flex flex-col items-center gap-4">
        <Separator />
        {input.buttons?.map((el, i) => (
          <div key={i}>
            <button className="text-black bg-[#dcf8c6] text-sm hover:text-black">
              {el.text}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        {user?.email && (
          <div className="text-xs text-right">Sent by:{user?.email}</div>
        )}
        <div className="text-xs font-light text-right">
          {new Date(date).toLocaleDateString()}&nbsp;
          {new Date(date).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
