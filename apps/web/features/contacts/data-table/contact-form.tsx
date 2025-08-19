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
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { ContactFormValues, ContactFormSchema } from "../_lib/schema";
import { PhoneInput } from "@workspace/ui/components/phone-input";
import { getSelectTags } from "@/features/tags/_lib/queries";
import { MultiSelect } from "@workspace/ui/components/multi-select";

interface TagsFormProps {
  onSubmit: (values: ContactFormValues) => void;
  initialValues?: Partial<ContactFormValues>;
  tags: Awaited<ReturnType<typeof getSelectTags>>;
}

export function ContactForm({ onSubmit, initialValues, tags }: TagsFormProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      phoneNumber: initialValues?.phoneNumber ?? "",
      email: initialValues?.email ?? "",
      tags: initialValues?.tags ?? [],
    },
  });

  function handleFormSubmit(data: ContactFormValues) {
    onSubmit(data);
  }


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter tag name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <PhoneInput
                  placeholder="+971 50 XXX XXXX"
                  {...field}
                  defaultCountry="AE"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <MultiSelect
                  options={tags}
                  onValueChange={field.onChange}
                  value={field.value || []}
                  defaultValue={field.value || []}
                  placeholder="Select tags"
                  variant="default"
                  maxCount={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
