/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

export function AutoArrayInputs({
  baseName,
  label,
}: {
  baseName: string;
  label: string;
}) {
  const { control } = useFormContext();

  const example = useFieldArray({
    control,
    name: baseName,
  });

  return (
    <div className="space-y-2">
      {example.fields.length === 0 ? null : (
        <div className="grid gap-2">
          <div className="text-sm">{label}</div>
          {example.fields.map((example, i) => (
            <FormField
              control={control}
              key={example.id}
              name={`${baseName}.${i}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Param {i + 1}</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
