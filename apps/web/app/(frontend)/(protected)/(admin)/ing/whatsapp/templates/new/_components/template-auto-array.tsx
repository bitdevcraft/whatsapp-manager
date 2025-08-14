"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import React from "react";
import { useFormContext } from "react-hook-form";

export function AutoArrayInputs({
  baseName,
  label,
}: {
  baseName: string;
  label: string;
}) {
  const { control } = useFormContext();

  const [len, setLen] = React.useState(0);
  React.useEffect(() => {
    const v = control._formValues;
    const parts = baseName.split(".");
    let cur: any = v;
    for (const p of parts) {
      if (cur == null) break;
      cur = cur[p];
    }
    setLen(Array.isArray(cur) ? cur.length : 0);
  });
  return (
    <div className="space-y-2">
      {len === 0 ? null : (
        <div className="grid gap-2">
          <div className="text-sm">{label}</div>
          {Array.from({ length: len }).map((_, i) => (
            <FormField
              key={i}
              control={control}
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
