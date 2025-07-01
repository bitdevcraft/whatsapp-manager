"use client";

import { getContactConversation } from "@/features/conversations/_lib/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConversationBody, User } from "@workspace/db";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { SendHorizonal } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "@workspace/ui/components/separator";

const FormSchema = z.object({
  text: z.string().nonempty(),
});

type FormValues = z.infer<typeof FormSchema>;

export interface Props {
  promises: Promise<[Awaited<ReturnType<typeof getContactConversation>>]>;
}
export default function Conversation({ promises }: Props) {
  const [data] = React.use(promises);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = async (input: FormValues) => {
    console.log(input);
  };

  return (
    <div className="flex min-h-[90vh] border w-full flex-col justify-between">
      <ScrollArea className="h-[80vh] p-2">
        {data.map((el, i) => (
          <div
            key={i}
            className={`flex mb-2 ${el.direction === "inbound" ? "justify-start" : "justify-end"}`}
          >
            {el.body && (
              <PreviewMessage
                input={el.body}
                date={el.createdAt}
                user={el.user}
              />
            )}
          </div>
        ))}
        <div ref={endRef} />
      </ScrollArea>

      <Form {...form}>
        <form
          className="bg-background p-4 flex gap-2 w-full"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            name="text"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea {...field} placeholder="Message" rows={1} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button size="icon" type="submit">
            <SendHorizonal />
          </Button>
        </form>
      </Form>
    </div>
  );
}

function PreviewMessage({
  input,
  date,
  user,
}: {
  input: ConversationBody;
  date: Date;
  user?: User | null;
}) {
  return (
    <div className="border rounded max-w-md text-wrap p-4 text-black bg-[#dcf8c6] grid gap-2">
      <div>{input.header?.text}</div>
      <div>{input.body?.text}</div>
      <div className="text-sm font-light text-muted">{input.footer}</div>
      <div className="flex flex-col items-center gap-4">
        <Separator />
        {input.buttons?.map((el, i) => (
          <div key={i}>
            <button className="text-black/50 bg-[#dcf8c6] text-sm hover:text-black">
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
