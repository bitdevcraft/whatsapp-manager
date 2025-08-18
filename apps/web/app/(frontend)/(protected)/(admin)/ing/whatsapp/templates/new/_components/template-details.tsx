"use client";

import { toSnake } from "@/utils/string-helper";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useFormContext } from "react-hook-form";
import React from "react";
import { LanguagesEnum } from "@workspace/wa-cloud-api";
import { BaseCreateValue } from "@/types/validations/templates/template-schema";

export function TemplateDetails() {
  const { control } = useFormContext<BaseCreateValue>();

  const categoryOptions = ["MARKETING", "UTILITY", "AUTHENTICATION"] as const;
  const parameterFormatOptions = ["POSITIONAL", "NAMED"] as const;
  const languageOptions = React.useMemo(
    () =>
      Object.values(LanguagesEnum).filter(
        (v): v is LanguagesEnum => typeof v === "string"
      ),
    []
  );

  return (
    <>
      {/* name */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input
                placeholder="template_name"
                {...field}
                onChange={(e) => field.onChange(toSnake(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex gap-4 flex-col md:flex-row">
        {/* category */}
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(v) => field.onChange(v)}
                  defaultValue={field.value as unknown as string | undefined}
                  value={field.value as unknown as string | undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* parameter_format */}
        <FormField
          control={control}
          name="parameter_format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parameter Format</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {parameterFormatOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
