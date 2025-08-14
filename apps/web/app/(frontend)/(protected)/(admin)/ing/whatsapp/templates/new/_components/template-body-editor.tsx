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
import type { ControllerRenderProps } from "react-hook-form";
import { nextPositionalIndex, insertAtCursor } from "../_lib/utils";

export function BodyEditor({
  control,
  index,
  parameterFormat,
  syncExamples,
}: {
  control: any;
  index: number;
  parameterFormat: "POSITIONAL" | "NAMED";
  syncExamples: (opts?: { bodyTextOverride?: string }) => void;
}) {
  return (
    <FormField
      control={control}
      name={`components.${index}.text`}
      render={({ field }) => (
        <BodyEditorField
          field={field}
          parameterFormat={parameterFormat}
          syncExamples={syncExamples}
        />
      )}
    />
  );
}

/** Separate component so hooks are only used at the top level of a React component, not inside a render callback. */
function BodyEditorField({
  field,
  parameterFormat,
  syncExamples,
}: {
  field: ControllerRenderProps<any, any>;
  parameterFormat: "POSITIONAL" | "NAMED";
  syncExamples: (opts?: { bodyTextOverride?: string }) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const setRefs = React.useCallback(
    (el: HTMLInputElement | null) => {
      inputRef.current = el;
      field.ref(el);
    },
    [field]
  );

  const onAddVariable = React.useCallback(() => {
    const current = String(field.value ?? "");
    if (parameterFormat === "POSITIONAL") {
      const nextIndex = nextPositionalIndex(current);
      const insertion = `{{${nextIndex}}}`;
      const next = insertAtCursor(inputRef.current, current, insertion);
      field.onChange(next);
      syncExamples({ bodyTextOverride: next });
      return;
    }
    const insertion = `{{}}`;
    const start =
      (inputRef.current?.selectionStart ?? String(current).length) + 2;
    const next = insertAtCursor(inputRef.current, current, insertion, start);
    field.onChange(next);
    syncExamples({ bodyTextOverride: next });
  }, [field, parameterFormat, syncExamples]);

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value as string;
      field.onChange(val);
      syncExamples({ bodyTextOverride: val });
    },
    [field, syncExamples]
  );

  return (
    <FormItem>
      <FormLabel>Body Text</FormLabel>
      <FormControl>
        <Input
          {...field}
          ref={setRefs}
          placeholder="e.g. Dear {{1}} or Dear {{name}}"
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
