"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useForm } from "react-hook-form";
import z from "zod";

const FormSchema = z.object({
  adAccountId: z.string().nonempty(),
});

type FormValue = z.infer<typeof FormSchema>;

export default function AdAccountForm() {
  const form = useForm<FormValue>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      adAccountId: "",
    },
  });

  return (
    <div>
      <Form {...form}>
        <div className="grid gap-4">
          <FormField
            name="template.template"
            render={({ field }) => (
              <FormItem className="grid gap-4">
                <FormLabel>Ad Account ID</FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="sm">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
}
