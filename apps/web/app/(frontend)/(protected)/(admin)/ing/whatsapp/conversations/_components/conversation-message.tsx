"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { SendHorizonal } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import axios from "axios";
import { useQueryState } from "nuqs";
import { nanoid } from "nanoid";
import { useSearchMessageStore } from "../_store/message-store";

const FormSchema = z.object({
  text: z.string().nonempty("Message should not be empty"),
});

type FormValues = z.infer<typeof FormSchema>;

export interface Props {
  contactId: string;
}
export default function ConversationMessage({ contactId }: Props) {
  const [reload, setReload] = useQueryState("rId", {
    defaultValue: "",
    shallow: false,
  });

  const { updateRandomId, clearSearchMessageId, clearSearchString } =
    useSearchMessageStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = async (input: FormValues) => {
    try {
      await axios.post("/api/whatsapp/conversations", {
        contactId,
        text: input.text,
      });

      updateRandomId();
      clearSearchMessageId();
      clearSearchString();

      form.reset();
      setReload(nanoid());
    } catch (error) {
      toast.error("Error Sending");
    }
  };

  return (
    <Form {...form}>
      <form
        className="bg-background flex gap-2 w-full"
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
  );
}
