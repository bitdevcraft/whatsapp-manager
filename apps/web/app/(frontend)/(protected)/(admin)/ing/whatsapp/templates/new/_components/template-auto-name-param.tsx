"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useFormContext, useWatch } from "react-hook-form";

export function AutoNamedParamsInputs({
  baseName,
  label,
}: {
  baseName: string; // e.g. components.X.example.body_text_named_params
  label: string;
}) {
  const { control } = useFormContext();

  const params = useWatch({
    control,
    name: baseName as any,
  }) as Array<{ param_name: string; example: string }> | undefined;

  if (!params?.length) return null;

  return (
    <div className="space-y-2">
      <div className="text-sm">{label}</div>
      {params.map((_, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 rounded-md border p-2">
          <FormField
            control={control}
            name={`${baseName}.${i}.param_name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Param Name</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${baseName}.${i}.example`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Example</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
}
