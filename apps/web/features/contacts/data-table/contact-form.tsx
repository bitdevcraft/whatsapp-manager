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
import { MultiSelect } from "@workspace/ui/components/multi-select";
import { PhoneInput } from "@workspace/ui/components/phone-input";
import * as React from "react";
import { useForm } from "react-hook-form";

import { getSelectTags } from "@/features/tags/_lib/queries";

import { ContactFormSchema, ContactFormValues } from "../_lib/schema";

interface TagsFormProps {
  initialValues?: Partial<ContactFormValues>;
  onSubmit: (values: ContactFormValues) => void;
  tags: Awaited<ReturnType<typeof getSelectTags>>;
}

export function ContactForm({ initialValues, onSubmit, tags }: TagsFormProps) {
  const form = useForm<ContactFormValues>({
    defaultValues: {
      email: initialValues?.email ?? "",
      name: initialValues?.name ?? "",
      phoneNumber: initialValues?.phoneNumber ?? "",
      tags: initialValues?.tags ?? [],
    },
    resolver: zodResolver(ContactFormSchema),
  });

  function handleFormSubmit(data: ContactFormValues) {
    onSubmit(data);
  }


  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(handleFormSubmit)}
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
                  defaultValue={field.value || []}
                  maxCount={3}
                  onValueChange={field.onChange}
                  options={tags}
                  placeholder="Select tags"
                  value={field.value || []}
                  variant="default"
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
