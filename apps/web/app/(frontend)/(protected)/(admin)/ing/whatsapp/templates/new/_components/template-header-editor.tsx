/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@workspace/ui/components/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import React from "react";
import { toast } from "sonner";
import type { ControllerRenderProps } from "react-hook-form";
import { insertAtCursor } from "../_lib/utils";

export function HeaderEditor({
  control,
  index,
  parameterFormat,
  syncExamples,
}: {
  control: any;
  index: number;
  parameterFormat: "POSITIONAL" | "NAMED";
  syncExamples: (opts?: { headerTextOverride?: string }) => void;
}) {
  return (
    <FormField
      control={control}
      name={`components.${index}.text`}
      render={({ field }) => (
        <HeaderEditorField
          field={field}
          parameterFormat={parameterFormat}
          syncExamples={syncExamples}
        />
      )}
    />
  );
}

/** Separate component so hooks live at the top level (no hooks inside callbacks). */
function HeaderEditorField({
  field,
  parameterFormat,
  syncExamples,
}: {
  field: ControllerRenderProps<any, any>;
  parameterFormat: "POSITIONAL" | "NAMED";
  syncExamples: (opts?: { headerTextOverride?: string }) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const VAR_RE = /\{\{[^{}\n]*}}/g;

  const setRefs = React.useCallback(
    (el: HTMLInputElement | null) => {
      inputRef.current = el;
      field.ref(el);
    },
    [field]
  );

  const onAddVariable = React.useCallback(() => {
    const current = String(field.value ?? "");

    // Header rule: only ONE variable allowed
    const allVars = current.match(VAR_RE) || [];
    if (allVars.length >= 1) {
      toast.warning("Header can contain only one variable.");
      return;
    }

    if (parameterFormat === "POSITIONAL") {
      const insertion = `{{1}}`;
      const next = insertAtCursor(inputRef.current, current, insertion);
      field.onChange(next);
      syncExamples({ headerTextOverride: next });
      return;
    }

    // NAMED → insert {{}} and place cursor inside braces
    const insertion = `{{}}`;
    const start =
      (inputRef.current?.selectionStart ?? String(current).length) + 2;
    const next = insertAtCursor(inputRef.current, current, insertion, start);
    field.onChange(next);
    syncExamples({ headerTextOverride: next });
  }, [field, parameterFormat, syncExamples]);

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value as string;

      // Enforce "only one variable"
      const allVars = val.match(VAR_RE) || [];
      if (allVars.length > 1) {
        const last = allVars[allVars.length - 1]!;
        const lastIndex = val.lastIndexOf(last);
        if (lastIndex >= 0) {
          val = val.slice(0, lastIndex) + val.slice(lastIndex + last.length);
          toast.warning(
            "Only one {{…}} variable allowed in header. Removed the extra one."
          );
        }
      }

      field.onChange(val);
      syncExamples({ headerTextOverride: val });
    },
    [field, syncExamples]
  );

  return (
    <FormItem>
      <FormLabel>Header Text</FormLabel>
      <FormControl>
        <Input
          {...field}
          ref={setRefs}
          placeholder="e.g. Hello {{1}} or Hello {{name}}"
          onChange={onChange}
        />
      </FormControl>
      <div className="mt-1 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddVariable}
          className="border"
        >
          Add Variable
        </Button>
      </div>
      <FormMessage />
    </FormItem>
  );
}
