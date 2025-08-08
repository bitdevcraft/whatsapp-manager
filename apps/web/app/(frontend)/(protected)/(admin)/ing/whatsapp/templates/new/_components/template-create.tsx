"use client";

import * as React from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  TemplateCreateSchema,
  type TemplateCreateValue,
  defaultValue,
} from "../_lib/validation";

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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { toast } from "sonner";

/* -----------------------------
 * Utilities
 * --------------------------- */
const toSnake = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();

// {{1}} {{2}} ... → [1,2,...] (unique, sorted)
function parsePositional(text: string | undefined): number[] {
  if (!text) return [];
  const matches = text.match(/\{\{\s*(\d+)\s*\}\}/g) || [];
  const nums = matches
    .map((m) => Number(m.replace(/[^\d]/g, "")))
    .filter((n) => Number.isFinite(n));
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

// {{name}} {{email}} (no spaces inside) → ["name","email"]
function parseNamed(text: string | undefined): string[] {
  if (!text) return [];
  const re = /\{\{\s*([^\s{}]+)\s*\}\}/g;
  const names: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    names.push(m[1]!);
  }
  return Array.from(new Set(names));
}

// Get next positional index (e.g., next after {{1}} is 2)
function nextPositionalIndex(text: string | undefined) {
  const nums = parsePositional(text);
  return nums.length ? Math.max(...nums) + 1 : 1;
}

function insertAtCursor(
  el: HTMLInputElement | null,
  current: string,
  insertion: string,
  placeCursorAt?: number // optional absolute index to move caret to
) {
  if (!el) return current + insertion;
  const start = el.selectionStart ?? current.length;
  const end = el.selectionEnd ?? current.length;
  const newValue = current.slice(0, start) + insertion + current.slice(end);
  // next tick cursor move
  queueMicrotask(() => {
    const nextPos = placeCursorAt ?? start + insertion.length;
    try {
      el.setSelectionRange(nextPos, nextPos);
      el.focus();
    } catch {}
  });
  return newValue;
}

/* -----------------------------
 * Component
 * --------------------------- */
export default function TemplateCreateForm({
  initialValues,
}: {
  initialValues?: Partial<TemplateCreateValue>;
}) {
  const form = useForm<TemplateCreateValue>({
    resolver: zodResolver(TemplateCreateSchema),
    defaultValues: { ...defaultValue, ...initialValues },
    mode: "onSubmit",
  });

  const { control, handleSubmit, watch, setValue, getValues } = form;

  // Only allow adding BUTTONS; HEADER/BODY/FOOTER are fixed
  const componentsFA = useFieldArray({
    control,
    name: "components",
  });

  // Helper: find current indices for header/body/footer to be robust even if BUTTONS are inserted
  const findIndexByType = (t: "HEADER" | "BODY" | "FOOTER" | "BUTTONS") => {
    const comps = getValues("components");
    return comps.findIndex((c: any) => c?.type === t);
  };

  // Enforce snake_case live in name
  const nameVal = watch("name");
  React.useEffect(() => {
    if (typeof nameVal === "string") {
      const snake = toSnake(nameVal);
      if (snake !== nameVal) setValue("name", snake);
    }
  }, [nameVal, setValue]);

  // Watchers for auto-examples
  const parameterFormat = watch("parameter_format");
  const headerIdx = findIndexByType("HEADER");
  const bodyIdx = findIndexByType("BODY");

  const headerFormat = useWatch({
    control,
    name:
      headerIdx >= 0
        ? (`components.${headerIdx}.format` as any)
        : (undefined as any),
  }) as "TEXT" | "IMAGE" | undefined;

  const headerText = useWatch({
    control,
    name:
      headerIdx >= 0
        ? (`components.${headerIdx}.text` as any)
        : (undefined as any),
  }) as string | undefined;

  const bodyText = useWatch({
    control,
    name:
      bodyIdx >= 0 ? (`components.${bodyIdx}.text` as any) : (undefined as any),
  }) as string | undefined;

  // Sync examples whenever relevant inputs change
  React.useEffect(() => {
    // If header isn't TEXT, clear header examples
    if (headerIdx >= 0 && headerFormat !== "TEXT") {
      setValue(`components.${headerIdx}.example.header_text`, undefined, {
        shouldDirty: true,
      });
      setValue(
        `components.${headerIdx}.example.header_text_named_params`,
        undefined,
        { shouldDirty: true }
      );
    }

    if (
      headerIdx >= 0 &&
      headerFormat === "TEXT" &&
      typeof headerText === "string"
    ) {
      // match any {{...}} (no newline), non-greedy
      const all = headerText.match(/\{\{[^{}\n]*\}\}/g) || [];
      if (all.length > 1) {
        // remove the last placeholder occurrence
        const last = all[all.length - 1];
        const lastIndex = headerText.lastIndexOf(last!);
        if (lastIndex >= 0) {
          const fixed =
            headerText.slice(0, lastIndex) +
            headerText.slice(lastIndex + last!.length);
          setValue(`components.${headerIdx}.text`, fixed, {
            shouldDirty: true,
            shouldValidate: true,
          });
          // optional heads-up
          toast.warning(
            "Only one {{…}} variable allowed in header. Removed the extra one."
          );
        }
      }
    }

    // Clear all body examples first if format changes type
    if (bodyIdx >= 0) {
      setValue(`components.${bodyIdx}.example.body_text`, undefined, {
        shouldDirty: true,
      });
      setValue(
        `components.${bodyIdx}.example.body_text_named_params`,
        undefined,
        { shouldDirty: true }
      );
    }

    // Nothing to do without header/body indices
    if (headerIdx < 0 || bodyIdx < 0) return;

    // POSITIONAL mode
    if (parameterFormat === "POSITIONAL") {
      // HEADER TEXT positional only when header format is TEXT
      if (headerFormat === "TEXT") {
        const nums = parsePositional(headerText);
        // header_text: string[] with length = nums.length
        const current = getValues(
          `components.${headerIdx}.example.header_text`
        ) as string[] | undefined;
        const next =
          nums.length === 0
            ? undefined
            : Array.from({ length: nums.length }, (_, i) => current?.[i] ?? "");
        setValue(`components.${headerIdx}.example.header_text`, next, {
          shouldDirty: true,
        });
        // Clear the NAMED version
        setValue(
          `components.${headerIdx}.example.header_text_named_params`,
          undefined,
          {
            shouldDirty: true,
          }
        );
      } else {
        // header not text → clear
        setValue(`components.${headerIdx}.example.header_text`, undefined, {
          shouldDirty: true,
        });
      }

      // BODY positional
      const numsB = parsePositional(bodyText);
      const currentB = getValues(`components.${bodyIdx}.example.body_text`) as
        | string[][]
        | undefined;
      // We maintain exactly one example row (index 0)
      const prevRow = currentB?.[0] ?? [];
      const row =
        numsB.length === 0
          ? undefined
          : [
              Array.from(
                { length: numsB.length },
                (_, i) => prevRow?.[i] ?? ""
              ),
            ];
      setValue(`components.${bodyIdx}.example.body_text`, row, {
        shouldDirty: true,
      });
      // Clear the NAMED version
      setValue(
        `components.${bodyIdx}.example.body_text_named_params`,
        undefined,
        {
          shouldDirty: true,
        }
      );
    }

    // NAMED mode
    if (parameterFormat === "NAMED") {
      // HEADER named (only if TEXT)
      if (headerFormat === "TEXT") {
        const names = parseNamed(headerText);
        const current = (getValues(
          `components.${headerIdx}.example.header_text_named_params`
        ) || []) as Array<{ param_name: string; example: string }>;
        const map = new Map(current.map((o) => [o.param_name, o.example]));
        const next =
          names.length === 0
            ? undefined
            : names.map((n) => ({ param_name: n, example: map.get(n) ?? "" }));
        setValue(
          `components.${headerIdx}.example.header_text_named_params`,
          next,
          {
            shouldDirty: true,
          }
        );
        // Clear positional version
        setValue(`components.${headerIdx}.example.header_text`, undefined, {
          shouldDirty: true,
        });
      } else {
        setValue(
          `components.${headerIdx}.example.header_text_named_params`,
          undefined,
          {
            shouldDirty: true,
          }
        );
      }

      // BODY named
      const namesB = parseNamed(bodyText);
      const currentB = (getValues(
        `components.${bodyIdx}.example.body_text_named_params`
      ) || []) as Array<{ param_name: string; example: string }>;
      const mapB = new Map(currentB.map((o) => [o.param_name, o.example]));
      const nextB =
        namesB.length === 0
          ? undefined
          : namesB.map((n) => ({ param_name: n, example: mapB.get(n) ?? "" }));
      setValue(`components.${bodyIdx}.example.body_text_named_params`, nextB, {
        shouldDirty: true,
      });
      // Clear positional version
      setValue(`components.${bodyIdx}.example.body_text`, undefined, {
        shouldDirty: true,
      });
    }
  }, [
    parameterFormat,
    headerFormat,
    headerText,
    bodyText,
    headerIdx,
    bodyIdx,
    getValues,
    setValue,
  ]);

  const mutation = useMutation({
    mutationFn: async (payload: TemplateCreateValue) => {
      //   const res = await fetch("/api/submit", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(payload),
      //   });
      //   if (!res.ok) {
      //     const err = await res.json().catch(() => ({}));
      //     throw new Error(err?.error || "Request failed");
      //   }
      //   return (await res.json()) as { ok: boolean };
      console.log(payload);
    },
    onSuccess: () => {
      toast.success("Saved");
    },
    onError: (error: unknown) => {
      toast.error(
        <div>
          <p>Error</p>
          <p>
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      );
    },
  });

  const onSubmit = (values: TemplateCreateValue) => mutation.mutate(values);

  const categoryOptions = ["MARKETING", "UTILITY", "AUTHENTICATION"] as const;
  const parameterFormatOptions = ["POSITIONAL", "NAMED"] as const;
  const headerFormatOptions = ["TEXT", "IMAGE"] as const;
  const buttonTypeOptions = ["QUICK_REPLY", "URL", "PHONE_NUMBER"] as const;

  // Only allow adding BUTTONS
  const addButtons = () => {
    componentsFA.append({ type: "BUTTONS", buttons: [] } as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* name */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="snake_case_name"
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
          <Controller
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

          {/* parameter_format */}
          <Controller
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

        {/* Components Header */}
        <div className="space-y-3">
          {componentsFA.fields.length === 0 && (
            <p className="text-sm text-muted-foreground">No components.</p>
          )}

          <div className="space-y-4">
            {componentsFA.fields.map((comp, idx) => {
              const type = watch(`components.${idx}.type`) as
                | "HEADER"
                | "BODY"
                | "FOOTER"
                | "BUTTONS";

              return (
                <div key={comp.id} className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{type}</div>
                    {/* Remove button ONLY for BUTTONS */}
                    {type === "BUTTONS" && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => componentsFA.remove(idx)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* HEADER */}
                  {type === "HEADER" && (
                    <>
                      <Controller
                        control={control}
                        name={`components.${idx}.format`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Header Format</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                  {headerFormatOptions.map((opt) => (
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

                      {watch(`components.${idx}.format`) === "TEXT" && (
                        <FormField
                          control={control}
                          name={`components.${idx}.text`}
                          render={({ field }) => {
                            const inputRef =
                              React.useRef<HTMLInputElement>(null);

                            const onAddVariable = () => {
                              const pf = parameterFormat; // "POSITIONAL" | "NAMED"
                              const current = String(field.value ?? "");

                              // Header rule: only ONE variable allowed
                              const allVars =
                                current.match(/\{\{[^{}\n]*\}\}/g) || [];
                              if (allVars.length >= 1) {
                                toast.warning(
                                  "Header can contain only one variable."
                                );
                                return;
                              }

                              if (pf === "POSITIONAL") {
                                const idxNum = 1; // enforce always {{1}} for header
                                const insertion = `{{${idxNum}}}`;
                                const next = insertAtCursor(
                                  inputRef.current,
                                  current,
                                  insertion
                                );
                                field.onChange(next);
                                return;
                              }

                              // NAMED → insert {{}} and place cursor inside braces
                              const insertion = `{{}}`;
                              // caret should land between the braces -> +2 from start
                              const start =
                                (inputRef.current?.selectionStart ??
                                  String(current).length) + 2;
                              const next = insertAtCursor(
                                inputRef.current,
                                current,
                                insertion,
                                start
                              );
                              field.onChange(next);
                            };

                            return (
                              <FormItem>
                                <FormLabel>Header Text</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. Hello {{1}} or Hello {{name}}"
                                    {...field}
                                    ref={inputRef}
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
                          }}
                        />
                      )}

                      {/* Auto examples (read-only structure, editable values) */}
                      <HeaderAutoExamples
                        control={control}
                        index={idx}
                        parameterFormat={parameterFormat}
                      />
                    </>
                  )}

                  {/* BODY */}
                  {type === "BODY" && (
                    <>
                      <FormField
                        control={control}
                        name={`components.${idx}.text`}
                        render={({ field }) => {
                          const inputRef = React.useRef<HTMLInputElement>(null);

                          const onAddVariable = () => {
                            const pf = parameterFormat;
                            const current = String(field.value ?? "");

                            if (pf === "POSITIONAL") {
                              const nextIndex = nextPositionalIndex(current); // {{1}}, {{2}}, ...
                              const insertion = `{{${nextIndex}}}`;
                              const next = insertAtCursor(
                                inputRef.current,
                                current,
                                insertion
                              );
                              field.onChange(next);
                              return;
                            }

                            // NAMED → insert {{}} and place cursor inside braces
                            const insertion = `{{}}`;
                            const start =
                              (inputRef.current?.selectionStart ??
                                String(current).length) + 2;
                            const next = insertAtCursor(
                              inputRef.current,
                              current,
                              insertion,
                              start
                            );
                            field.onChange(next);
                          };

                          return (
                            <FormItem>
                              <FormLabel>Body Text</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Dear {{1}} or Dear {{name}}"
                                  {...field}
                                  ref={inputRef}
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
                        }}
                      />
                      <BodyAutoExamples
                        control={control}
                        index={idx}
                        parameterFormat={parameterFormat}
                      />
                    </>
                  )}

                  {/* FOOTER */}
                  {type === "FOOTER" && (
                    <FormField
                      control={control}
                      name={`components.${idx}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Footer Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Footer text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* BUTTONS */}
                  {type === "BUTTONS" && (
                    <ButtonsArray control={control} compIndex={idx} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Only Buttons can be added */}
            <Button type="button" variant="secondary" onClick={addButtons}>
              Add Buttons
            </Button>
          </div>
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Loading…" : "Submit"}
        </Button>
      </form>
    </Form>
  );
}

/* -----------------------------
 * Subcomponents: Auto Examples
 * --------------------------- */

function HeaderAutoExamples({
  control,
  index,
  parameterFormat,
}: {
  control: any;
  index: number;
  parameterFormat: "POSITIONAL" | "NAMED";
}) {
  // POSITIONAL → header_text: string[]
  if (parameterFormat === "POSITIONAL") {
    // Render inputs for header_text[i] if present
    return (
      <AutoArrayInputs
        control={control}
        baseName={`components.${index}.example.header_text`}
        label="Header Example Variables (auto)"
      />
    );
  }
  // NAMED → header_text_named_params: { param_name, example }[]
  return (
    <AutoNamedParamsInputs
      control={control}
      baseName={`components.${index}.example.header_text_named_params`}
      label="Header Named Params (auto)"
    />
  );
}

function BodyAutoExamples({
  control,
  index,
  parameterFormat,
}: {
  control: any;
  index: number;
  parameterFormat: "POSITIONAL" | "NAMED";
}) {
  if (parameterFormat === "POSITIONAL") {
    // body_text: string[][], show row 0 only
    return (
      <AutoMatrixRowInputs
        control={control}
        baseName={`components.${index}.example.body_text.0`}
        label="Body Example Variables (auto)"
      />
    );
  }
  // NAMED
  return (
    <AutoNamedParamsInputs
      control={control}
      baseName={`components.${index}.example.body_text_named_params`}
      label="Body Named Params (auto)"
    />
  );
}

/* -----------------------------
 * Reusable simple renderers
 * (NO add/remove buttons; auto-managed)
 * --------------------------- */

function AutoArrayInputs({
  control,
  baseName,
  label,
}: {
  control: any;
  baseName: string; // e.g., components.0.example.header_text
  label: string;
}) {
  // We don't need useFieldArray here; RHF can bind array indices directly.
  // Render a small dynamic list until undefined
  const [len, setLen] = React.useState(0);

  // Track length by peeking at form values on each render
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
      {len === 0 ? (
        <></>
      ) : (
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

function AutoMatrixRowInputs({
  control,
  baseName, // e.g. components.1.example.body_text.0
  label,
}: {
  control: any;
  baseName: string;
  label: string;
}) {
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
      {len === 0 ? (
        <></>
      ) : (
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

function AutoNamedParamsInputs({
  control,
  baseName, // e.g. components.0.example.header_text_named_params
  label,
}: {
  control: any;
  baseName: string;
  label: string;
}) {
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
      {len === 0 ? (
        <></>
      ) : (
        <div className="space-y-2">
          <div className="text-sm">{label}</div>
          {Array.from({ length: len }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-2 rounded-md border p-2"
            >
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
      )}
    </div>
  );
}

/* -----------------------------
 * Buttons array (manual add/remove OK)
 * --------------------------- */
function ButtonsArray({
  control,
  compIndex,
}: {
  control: any;
  compIndex: number;
}) {
  const fa = useFieldArray({
    control,
    name: `components.${compIndex}.buttons`,
  });

  const types = ["QUICK_REPLY", "URL", "PHONE_NUMBER"] as const;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">Buttons</span>
        <Button
          type="button"
          variant="secondary"
          onClick={() => fa.append({ type: "QUICK_REPLY", text: "" })}
        >
          Add Button
        </Button>
      </div>

      {fa.fields.length === 0 && (
        <p className="text-xs text-muted-foreground">No buttons.</p>
      )}

      <div className="space-y-3">
        {fa.fields.map((f, i) => {
          const typePath = `components.${compIndex}.buttons.${i}.type` as const;
          const typeValue = control._getWatch(typePath);

          return (
            <div
              key={f.id}
              className="grid grid-cols-1 gap-2 rounded-md border p-2"
            >
              <Controller
                control={control}
                name={typePath}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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

              <FormField
                control={control}
                name={`components.${compIndex}.buttons.${i}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Button text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(typeValue === "URL" || typeValue === undefined) && (
                <FormField
                  control={control}
                  name={`components.${compIndex}.buttons.${i}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL (if URL type)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {typeValue === "PHONE_NUMBER" && (
                <FormField
                  control={control}
                  name={`components.${compIndex}.buttons.${i}.phone_number`}
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
                  type="button"
                  variant="destructive"
                  onClick={() => fa.remove(i)}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
