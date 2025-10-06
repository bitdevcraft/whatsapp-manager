"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@workspace/ui/components/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { ErrorSummary } from "./helpers";

export function ButtonsArray({
  index,
  prefix,
}: {
  index: number;
  prefix?: string;
}) {
  const { control, trigger } = useFormContext(); // ✅ revalidation hook

  const base = prefix
    ? (`${prefix}.components.${index}` as const)
    : (`components.${index}` as const);

  const fa = useFieldArray({
    control,
    name: `${base}.buttons` as const,
  });

  const types = ["QUICK_REPLY", "URL", "PHONE_NUMBER"] as const;

  const canAdd = fa.fields.length < 2; // UI guard: at most 2
  const handleAdd = () => {
    if (!canAdd) return;
    fa.append({ text: "", type: "QUICK_REPLY" });
    void trigger(`${base}.buttons` as any); // 🔁 show superRefine errors immediately
  };

  const handleRemove = (i: number) => {
    // UI guard: keep at least 1
    if (fa.fields.length <= 1) return;
    fa.remove(i);
    void trigger(`${base}.buttons` as any);
  };

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-sm">Buttons</span>
        <Button
          disabled={!canAdd}
          onClick={handleAdd}
          type="button"
          variant="secondary"
        >
          Add Button
        </Button>
      </div>

      {/* 🔴 Clear, full-width summary for all buttons-level errors */}
      <ErrorSummary name={`${base}.buttons`} />

      {fa.fields.length === 0 && (
        <p className="text-xs text-muted-foreground">No buttons.</p>
      )}

      <div className="space-y-3">
        {fa.fields.map((f, i) => (
          <ButtonRow
            base={base}
            index={i}
            key={f.id}
            remove={() => handleRemove(i)}
            total={fa.fields.length}
            types={types}
          />
        ))}
      </div>
    </div>
  );
}

function ButtonRow({
  base,
  index,
  remove,
  total,
  types,
}: {
  base: string;
  index: number;
  remove: () => void;
  total: number;
  types: readonly ["QUICK_REPLY", "URL", "PHONE_NUMBER"];
}) {
  const { control, setValue, trigger } = useFormContext();

  const typePath = `${base}.buttons.${index}.type` as const;
  const typeValue = useWatch({ control, name: typePath }) as
    | "PHONE_NUMBER"
    | "QUICK_REPLY"
    | "URL"
    | undefined;

  const onTypeChange = (v: "PHONE_NUMBER" | "QUICK_REPLY" | "URL") => {
    // Update type
    setValue(typePath as any, v, { shouldDirty: true, shouldValidate: false });

    // Clear irrelevant fields to satisfy per-button rules
    const urlPath = `${base}.buttons.${index}.url` as const;
    const phonePath = `${base}.buttons.${index}.phone_number` as const;
    if (v === "URL") {
      setValue(phonePath as any, undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
    } else if (v === "PHONE_NUMBER") {
      setValue(urlPath as any, undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
    } else {
      setValue(urlPath as any, undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      setValue(phonePath as any, undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }

    // Re-validate the buttons signature (count/types/order)
    void trigger(`${base}.buttons` as any);
  };

  return (
    <div className="grid grid-cols-1 gap-2 rounded-md border p-2">
      {/* Type */}
      <FormField
        control={control}
        name={typePath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <FormControl>
              <Select onValueChange={onTypeChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Text */}
      <FormField
        control={control}
        name={`${base}.buttons.${index}.text`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Label</FormLabel>
            <FormControl>
              <Input placeholder="Button Label" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* URL only when URL type */}
      {typeValue === "URL" && (
        <FormField
          control={control}
          name={`${base}.buttons.${index}.url`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Phone only when PHONE_NUMBER type */}
      {typeValue === "PHONE_NUMBER" && (
        <FormField
          control={control}
          name={`${base}.buttons.${index}.phone_number`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+971 5x xxx xxxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="flex justify-end">
        <Button
          disabled={total <= 1} // UI guard: keep ≥ 1 button
          onClick={remove}
          type="button"
          variant="destructive"
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
