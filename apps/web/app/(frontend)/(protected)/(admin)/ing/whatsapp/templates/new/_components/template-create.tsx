"use client";

import * as React from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  Controller,
  ControllerRenderProps,
} from "react-hook-form";
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
import { LanguagesEnum } from "@workspace/wa-cloud-api";
import axios from "axios";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@workspace/ui/components/data-importer/file-upload";
import { Upload, X } from "lucide-react";
import { pruneObject } from "@/utils/prune";

/* -----------------------------
 * Utilities
 * --------------------------- */
const toSnake = (s: string) =>
  s
    .replace(/\s+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase()
    .trim();

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
  while ((m = re.exec(text))) names.push(m[1]!);
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
    mode: "onChange",
  });

  const { control, handleSubmit, watch, setValue, getValues } = form;

  // Only allow adding BUTTONS; HEADER/BODY/FOOTER are fixed
  const componentsFA = useFieldArray({ control, name: "components" });

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

  const componentsWatch = useWatch({
    control,
    name: "components",
  }) as Array<any>;
  const hasButtons =
    Array.isArray(componentsWatch) &&
    componentsWatch.some((c) => c?.type === "BUTTONS");

  /* -----------------------------
   * syncExamples — instant updates
   * --------------------------- */
  const syncExamples = React.useCallback(
    ({
      headerTextOverride,
      bodyTextOverride,
    }: { headerTextOverride?: string; bodyTextOverride?: string } = {}) => {
      const hIdx = findIndexByType("HEADER");
      const bIdx = findIndexByType("BODY");
      if (hIdx < 0 || bIdx < 0) return;

      const pf = getValues("parameter_format");
      const hFormat = getValues(`components.${hIdx}.format`) as
        | "TEXT"
        | "IMAGE"
        | undefined;

      const hText = headerTextOverride ?? getValues(`components.${hIdx}.text`);
      const bText = bodyTextOverride ?? getValues(`components.${bIdx}.text`);

      // Clear non-applicable branches first
      if (hFormat !== "TEXT") {
        setValue(`components.${hIdx}.example.header_text`, undefined, {
          shouldDirty: true,
        });
        setValue(
          `components.${hIdx}.example.header_text_named_params`,
          undefined,
          { shouldDirty: true }
        );
      }

      setValue(`components.${bIdx}.example.body_text`, undefined, {
        shouldDirty: true,
      });
      setValue(`components.${bIdx}.example.body_text_named_params`, undefined, {
        shouldDirty: true,
      });

      if (pf === "POSITIONAL") {
        // HEADER positional (only if TEXT)
        if (hFormat === "TEXT") {
          const nums = parsePositional(hText);
          const current = getValues(
            `components.${hIdx}.example.header_text`
          ) as string[] | undefined;
          const next =
            nums.length === 0
              ? undefined
              : Array.from(
                  { length: nums.length },
                  (_, i) => current?.[i] ?? ""
                );
          setValue(`components.${hIdx}.example.header_text`, next, {
            shouldDirty: true,
          });
          setValue(
            `components.${hIdx}.example.header_text_named_params`,
            undefined,
            { shouldDirty: true }
          );
        }

        // BODY positional → one row: [["", "", ...]]
        const numsB = parsePositional(bText);
        const currentB = getValues(`components.${bIdx}.example.body_text`) as
          | string[][]
          | undefined;
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
        setValue(`components.${bIdx}.example.body_text`, row, {
          shouldDirty: true,
        });
        setValue(
          `components.${bIdx}.example.body_text_named_params`,
          undefined,
          { shouldDirty: true }
        );
      } else {
        // NAMED
        if (hFormat === "TEXT") {
          const names = parseNamed(hText);
          const current = (getValues(
            `components.${hIdx}.example.header_text_named_params`
          ) || []) as Array<{ param_name: string; example: string }>;
          const map = new Map(current.map((o) => [o.param_name, o.example]));
          const next =
            names.length === 0
              ? undefined
              : names.map((n) => ({
                  param_name: n,
                  example: map.get(n) ?? "",
                }));
          setValue(
            `components.${hIdx}.example.header_text_named_params`,
            next,
            { shouldDirty: true }
          );
          setValue(`components.${hIdx}.example.header_text`, undefined, {
            shouldDirty: true,
          });
        }

        const namesB = parseNamed(bText);
        const currentB = (getValues(
          `components.${bIdx}.example.body_text_named_params`
        ) || []) as Array<{ param_name: string; example: string }>;
        const mapB = new Map(currentB.map((o) => [o.param_name, o.example]));
        const nextB =
          namesB.length === 0
            ? undefined
            : namesB.map((n) => ({
                param_name: n,
                example: mapB.get(n) ?? "",
              }));
        setValue(`components.${bIdx}.example.body_text_named_params`, nextB, {
          shouldDirty: true,
        });
        setValue(`components.${bIdx}.example.body_text`, undefined, {
          shouldDirty: true,
        });
      }
    },
    [getValues, setValue] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /**
   * File Upload
   */

  const [fileRecord, setFileRecord] = React.useState<Record<string, File>>({});

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const onFileUpload = async (
    data: File[],
    field: ControllerRenderProps<
      TemplateCreateValue,
      `components.${number}.example.header_handle.${number}`
    >
  ) => {
    const file = data[0];
    if (!file) return;

    setFileRecord((prev) => ({
      ...prev,
      [field.name]: file,
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`/api/whatsapp/files`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { h } = response.data;

      field.onChange(h);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Keep effect as a safety net for format changes, plus header single-var rule
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

    // Enforce: only 1 {{...}} in header
    if (
      headerIdx >= 0 &&
      headerFormat === "TEXT" &&
      typeof headerText === "string"
    ) {
      const all = headerText.match(/\{\{[^{}\n]*\}\}/g) || [];
      if (all.length > 1) {
        const last = all[all.length - 1]!;
        const lastIndex = headerText.lastIndexOf(last);
        if (lastIndex >= 0) {
          const fixed =
            headerText.slice(0, lastIndex) +
            headerText.slice(lastIndex + last.length);
          setValue(`components.${headerIdx}.text`, fixed, {
            shouldDirty: true,
            shouldValidate: true,
          });
          toast.warning(
            "Only one {{…}} variable allowed in header. Removed the extra one."
          );
        }
      }
    }

    // Sync based on current values (handles parameter_format / format changes)
    syncExamples();
  }, [
    parameterFormat,
    headerFormat,
    headerText,
    bodyText,
    headerIdx,
    bodyIdx,
    setValue,
    syncExamples,
  ]);

  const mutation = useMutation({
    mutationFn: async (payload: TemplateCreateValue) => {
      const cleanPayload = pruneObject(payload, {
        removeEmptyObjects: true,
        removeEmptyArrays: true,
        trimStrings: true,
      });

      const result = await axios.post(
        "/api/whatsapp/templates/create",
        cleanPayload
      );

      return result.data;
    },
    onSuccess: () => toast.success("Saved"),
    onError: (error: unknown) =>
      toast.error(
        <div>
          <p>Error</p>
          <p>
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      ),
  });

  const onSubmit = (values: TemplateCreateValue) => mutation.mutate(values);

  const categoryOptions = ["MARKETING", "UTILITY", "AUTHENTICATION"] as const;
  const parameterFormatOptions = ["POSITIONAL", "NAMED"] as const;
  const headerFormatOptions = ["TEXT", "IMAGE"] as const;
  const buttonTypeOptions = ["QUICK_REPLY", "URL", "PHONE_NUMBER"] as const;
  const languageOptions = React.useMemo(
    () =>
      Object.values(LanguagesEnum).filter(
        (v): v is LanguagesEnum => typeof v === "string"
      ),
    []
  );

  // Only allow adding BUTTONS
  const addButtons = () => {
    const comps = getValues("components");
    if (Array.isArray(comps) && comps.some((c: any) => c?.type === "BUTTONS")) {
      return; // already have one → do nothing
    }
    componentsFA.append({ type: "BUTTONS", buttons: [] } as any);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
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
            <Controller
              control={control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(v) => field.onChange(v)}
                      defaultValue={
                        field.value as unknown as string | undefined
                      }
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
                  <div
                    key={comp.id}
                    className="rounded-lg border p-3 space-y-3"
                  >
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
                                const pf = parameterFormat;
                                const current = String(field.value ?? "");
                                // Header rule: only ONE variable allowed
                                const allVars =
                                  current.match(/\{\{[^{}\n]*}}/g) || [];
                                if (allVars.length >= 1) {
                                  toast.warning(
                                    "Header can contain only one variable."
                                  );
                                  return;
                                }
                                if (pf === "POSITIONAL") {
                                  const insertion = `{{1}}`;
                                  const next = insertAtCursor(
                                    inputRef.current,
                                    current,
                                    insertion
                                  );
                                  field.onChange(next);
                                  syncExamples({ headerTextOverride: next }); // instant
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
                                syncExamples({ headerTextOverride: next }); // instant
                              };
                              return (
                                <FormItem>
                                  <FormLabel>Header Text</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      ref={(el) => {
                                        field.ref(el);
                                        inputRef.current = el;
                                      }}
                                      placeholder="e.g. Hello {{1}} or Hello {{name}}"
                                      onChange={(e) => {
                                        let val = e.target.value as string;
                                        // enforce "only one variable"
                                        const allVars =
                                          val.match(/\{\{[^{}\n]*}}/g) || [];
                                        if (allVars.length > 1) {
                                          const last =
                                            allVars[allVars.length - 1]!;
                                          const lastIndex =
                                            val.lastIndexOf(last);
                                          if (lastIndex >= 0) {
                                            val =
                                              val.slice(0, lastIndex) +
                                              val.slice(
                                                lastIndex + last.length
                                              );
                                            toast.warning(
                                              "Only one {{…}} variable allowed in header. Removed the extra one."
                                            );
                                          }
                                        }
                                        field.onChange(val);
                                        syncExamples({
                                          headerTextOverride: val,
                                        }); // instant
                                      }}
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
                        {watch(`components.${idx}.format`) === "IMAGE" && (
                          <FormField
                            control={control}
                            name={`components.${idx}.example.header_handle.0`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel>Image</FormLabel>
                                  <FormControl>
                                    {/* <Input {...field} placeholder="Enter text" /> */}
                                    <FileUpload
                                      {...field}
                                      maxSize={5 * 1024 * 1024}
                                      className="w-full max-w-md mx-auto"
                                      value={Object.values(fileRecord)}
                                      onValueChange={(files) =>
                                        onFileUpload(files, field)
                                      }
                                      onFileReject={onFileReject}
                                    >
                                      <FileUploadDropzone>
                                        <div className="flex flex-col items-center gap-1 text-center">
                                          <div className="flex items-center justify-center rounded-full border p-2.5">
                                            <Upload className="size-6 text-muted-foreground" />
                                          </div>
                                          <p className="font-medium text-sm">
                                            Drag & drop files here
                                          </p>
                                          <p className="text-muted-foreground text-xs">
                                            Or click to browse (max 2 files, up
                                            to 5MB each)
                                          </p>
                                        </div>
                                        <FileUploadTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 w-fit"
                                          >
                                            Browse files
                                          </Button>
                                        </FileUploadTrigger>
                                      </FileUploadDropzone>
                                      <FileUploadList>
                                        {Object.values(fileRecord).map(
                                          (file, index) => (
                                            <FileUploadItem
                                              key={index}
                                              value={file}
                                            >
                                              <FileUploadItemPreview />
                                              <FileUploadItemMetadata />
                                              <FileUploadItemDelete asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="size-7"
                                                >
                                                  <X />
                                                </Button>
                                              </FileUploadItemDelete>
                                            </FileUploadItem>
                                          )
                                        )}
                                      </FileUploadList>
                                    </FileUpload>
                                  </FormControl>
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
                            const inputRef =
                              React.useRef<HTMLInputElement>(null);
                            const onAddVariable = () => {
                              const pf = parameterFormat;
                              const current = String(field.value ?? "");
                              if (pf === "POSITIONAL") {
                                const nextIndex = nextPositionalIndex(current);
                                const insertion = `{{${nextIndex}}}`;
                                const next = insertAtCursor(
                                  inputRef.current,
                                  current,
                                  insertion
                                );
                                field.onChange(next);
                                syncExamples({ bodyTextOverride: next }); // instant
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
                              syncExamples({ bodyTextOverride: next }); // instant
                            };
                            return (
                              <FormItem>
                                <FormLabel>Body Text</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    ref={(el) => {
                                      field.ref(el);
                                      inputRef.current = el;
                                    }}
                                    placeholder="e.g. Dear {{1}} or Dear {{name}}"
                                    onChange={(e) => {
                                      const val = e.target.value as string;
                                      field.onChange(val);
                                      syncExamples({ bodyTextOverride: val }); // instant
                                    }}
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
              {!hasButtons && (
                <Button type="button" variant="secondary" onClick={addButtons}>
                  Add Buttons
                </Button>
              )}
            </div>
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Loading…" : "Submit"}
          </Button>
        </form>
      </Form>
    </>
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
  if (parameterFormat === "POSITIONAL") {
    return (
      <AutoArrayInputs
        control={control}
        baseName={`components.${index}.example.header_text`}
        label="Header Example Variables (auto)"
      />
    );
  }
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
    return (
      <AutoMatrixRowInputs
        control={control}
        baseName={`components.${index}.example.body_text.0`}
        label="Body Example Variables (auto)"
      />
    );
  }
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

function AutoMatrixRowInputs({
  control,
  baseName,
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

function AutoNamedParamsInputs({
  control,
  baseName,
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
      {len === 0 ? null : (
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
