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
import { TagsFormValues, TagsFormSchema } from "../_lib/schema";

interface TagsFormProps {
  onSubmit: (values: TagsFormValues) => void;
  initialValues?: Partial<TagsFormValues>;
}

export function TagsForm({ onSubmit, initialValues }: TagsFormProps) {
  const form = useForm<TagsFormValues>({
    resolver: zodResolver(TagsFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
    },
  });

  function handleFormSubmit(data: TagsFormValues) {
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
        <Button type="submit">Create Tag</Button>
      </form>
    </Form>
  );
}
