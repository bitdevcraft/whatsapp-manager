"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { Button } from "@workspace/ui/components/button";
import { TagsFormSchema, TagsFormValues } from "@/features/tags/_lib/schema";
import z from "zod";
import { toast } from "sonner";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

type FormValue = z.infer<typeof FormSchema>;

interface Props {
  onSubmit: (data: FormValue) => void;
}

export function InputOTPForm({ onSubmit }: Props) {
  const form = useForm<FormValue>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  //   function onSubmit(data: FormValue) {
  //     toast("You submitted the following values", {
  //       description: (
  //         <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
  //           <code className="text-white">{JSON.stringify(data, null, 2)}</code>
  //         </pre>
  //       ),
  //     });
  //   }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pin</FormLabel>
              <FormControl>
                {/* <Input placeholder="Enter tag name" {...field} /> */}
                <div className="flex justify-center w-full">
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </FormControl>
              <FormDescription>Please enter your 2FA Pin.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Register</Button>
      </form>
    </Form>
  );
}
