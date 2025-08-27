"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import * as React from "react";
import { useForm } from "react-hook-form";

import { TagsFormSchema, TagsFormValues } from "../_lib/schema";

interface TagsFormProps {
  initialValues?: Partial<TagsFormValues>;
  onSubmit: (values: TagsFormValues) => void;
}

export function TagsForm({ initialValues, onSubmit }: TagsFormProps) {
  const form = useForm<TagsFormValues>({
    defaultValues: {
      name: initialValues?.name ?? "",
    },
    resolver: zodResolver(TagsFormSchema),
  });

  function handleFormSubmit(data: TagsFormValues) {
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
        <Button type="submit">Create Tag</Button>
      </form>
    </Form>
  );
}
