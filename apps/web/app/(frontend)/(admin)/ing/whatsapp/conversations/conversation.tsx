"use client";

import { getContactConversation } from "@/features/conversations/_lib/queries";
import { ConversationBody } from "@workspace/db";
import { Button } from "@workspace/ui/components/button";
import React from "react";

export interface Props {
  promises: Promise<[Awaited<ReturnType<typeof getContactConversation>>]>;
}
export default function Conversation({ promises }: Props) {
  const [data] = React.use(promises);

  return (
    <div className="grid gap-2">
      {data.map((el, i) => (
        <div key={i}>
          {el.body && <PreviewMessage input={el.body} date={el.createdAt} />}
        </div>
      ))}
    </div>
  );
}

function PreviewMessage({
  input,
  date,
}: {
  input: ConversationBody;
  date: Date;
}) {
  return (
    <div className="border rounded max-w-md text-wrap p-4 text-black bg-[#dcf8c6] grid gap-2">
      <div>{input.header?.text}</div>
      <div>{input.body?.text}</div>
      <div className="text-sm font-light text-muted">{input.footer}</div>
      <div>
        {input.buttons?.map((el, i) => (
          <div key={i}>
            <Button>{el.text}</Button>
          </div>
        ))}
      </div>
      <div className="text-xs font-light text-right">
        {new Date(date).toLocaleDateString()}&nbsp;
        {new Date(date).toLocaleTimeString()}
      </div>
    </div>
  );
}
