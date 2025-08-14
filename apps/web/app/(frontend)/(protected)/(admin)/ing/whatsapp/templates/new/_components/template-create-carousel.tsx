/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  Controller,
  ControllerRenderProps,
  FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DevTool } from "@hookform/devtools";
import { useMutation } from "@tanstack/react-query";
import {
  TemplateCarouselCreateSchema,
  TemplateCarouselCreateValue,
  TemplateCreateSchema,
  type TemplateCreateValue,
  defaultValue,
  templateCarouselDefault,
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
import axios, { AxiosError } from "axios";
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
import { Trash, Upload, X } from "lucide-react";
import { pruneObject } from "@/utils/prune";
import { clean } from "better-auth/react";

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
    } catch {
      /* empty */
    }
  });
  return newValue;
}

/* -----------------------------
 * Component
 * --------------------------- */
export default function TemplateCreateForm({
  initialValues,
}: {
  initialValues?: Partial<TemplateCarouselCreateValue>;
}) {
  const form = useForm<TemplateCarouselCreateValue>({
    resolver: zodResolver(TemplateCarouselCreateSchema),
    defaultValues: { ...templateCarouselDefault, ...initialValues },
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
  const bodyIdx = findIndexByType("BODY");

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
    ({ bodyTextOverride }: { bodyTextOverride?: string } = {}) => {
      const bIdx = findIndexByType("BODY");
      if (bIdx < 0) return;

      const pf = getValues("parameter_format");

      const bText = bodyTextOverride ?? getValues(`components.${bIdx}.text`);

      setValue(`components.${bIdx}.example.body_text`, undefined, {
        shouldDirty: true,
      });
      setValue(`components.${bIdx}.example.body_text_named_params`, undefined, {
        shouldDirty: true,
      });

      if (pf === "POSITIONAL") {
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
    syncExamples();
  }, [syncExamples]);

  const mutation = useMutation({
    mutationFn: async (payload: TemplateCarouselCreateValue) => {
      const cleanPayload = pruneObject(payload, {
        removeEmptyObjects: true,
        removeEmptyArrays: true,
        removeEmptyStrings: true,
        trimStrings: true,
      });

      const result = await axios.post(
        "/api/whatsapp/templates/create",
        cleanPayload
      );

      return result.data;
    },
    onSuccess: () => toast.success("Saved"),
    onError: (error: AxiosError) => {
      toast.error(
        <div>
          <p className="text-xl">Error</p>
          <p>{(error.response?.data as any).error.error.error_user_title}</p>
          <p className="font-light">
            {(error.response?.data as any).error.error.error_user_msg}
          </p>
        </div>
      );
    },
  });

  const onSubmit = (values: TemplateCarouselCreateValue) =>
    mutation.mutate(values);

  const categoryOptions = ["MARKETING", "UTILITY", "AUTHENTICATION"] as const;
  const parameterFormatOptions = ["POSITIONAL", "NAMED"] as const;
  const headerFormatOptions = ["TEXT", "IMAGE"] as const;
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
                  | "BUTTONS"
                  | "CAROUSEL";
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

                    {/* BODY */}
                    {type === "BODY" && (
                      <>
                        <FormField
                          control={control}
                          name={`components.${idx}.text`}
                          render={({ field }) => {
                            const inputRef =
                              // eslint-disable-next-line react-hooks/rules-of-hooks
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

                    {type === "CAROUSEL" && (
                      <CarouselArray control={control} compIndex={idx} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Loading…" : "Submit"}
          </Button>
        </form>
      </Form>
      <DevTool control={control} />
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

/**
 * Carousel Array
 * @param param0
 * @returns
 */

function CarouselArray({
  control,
  compIndex,
}: {
  control: any;
  compIndex: number;
}) {
  const fa = useFieldArray({
    control,
    name: `components.${compIndex}.cards`,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">Cards</span>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            fa.append({
              components: [
                {
                  type: "HEADER",
                  format: "IMAGE",
                  example: {
                    header_handle: [""],
                  },
                },
                { type: "BUTTONS", buttons: [] },
              ],
            })
          }
        >
          Add Card
        </Button>
      </div>

      {fa.fields.length === 0 && (
        <p className="text-xs text-muted-foreground">No Carousel.</p>
      )}
      <div className="space-y-3">
        {fa.fields.map((f, idx) => {
          return (
            <div key={idx} className="border p-2 rounded relative">
              <CarouseComponentArray
                control={control}
                compIndex={compIndex}
                cardIndex={idx}
              />
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => fa.remove(idx)}
                  size="sm"
                >
                  <Trash />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CarouseComponentArray({
  control,
  compIndex,
  cardIndex,
}: {
  control: any;
  compIndex: number;
  cardIndex: number;
}) {
  const prefix = `components.${compIndex}.cards.${cardIndex}.components`;
  const [fileRecord, setFileRecord] = React.useState<Record<string, File>>({});

  const fa = useFieldArray({
    control,
    name: prefix,
  });

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const onFileUpload = async (
    data: File[],
    field: ControllerRenderProps<
      FieldValues,
      `components.${number}.cards.${number}.components.${number}.example.header_handle.${number}`
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

  return (
    <div className="space-y-2">
      {fa.fields.length === 0 && (
        <p className="text-xs text-muted-foreground">No Carousel.</p>
      )}
      <div className="space-y-3">
        {fa.fields.map((f, idx) => {
          const typePath = `${prefix}.${idx}.type` as const;
          const type = control._getWatch(typePath) as
            | "HEADER"
            | "BODY"
            | "FOOTER"
            | "BUTTONS";

          return (
            <div key={idx}>
              {/* HEADER */}
              {type === "HEADER" && (
                <>
                  <FormField
                    control={control}
                    name={`components.${compIndex}.cards.${cardIndex}.components.${idx}.example.header_handle.0`}
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
                                    Or click to browse (max 2 files, up to 5MB
                                    each)
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
                                    <FileUploadItem key={index} value={file}>
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
                </>
              )}
              {type === "BODY" && <></>}
              {type === "BUTTONS" && (
                <CarouselButtonsArray
                  control={control}
                  compIndex={compIndex}
                  cardIndex={cardIndex}
                  cardCompIndex={idx}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -----------------------------
 * Buttons array (manual add/remove OK)
 * --------------------------- */
function CarouselButtonsArray({
  control,
  compIndex,
  cardIndex,
  cardCompIndex,
}: {
  control: any;
  compIndex: number;
  cardIndex: number;
  cardCompIndex: number;
}) {
  const fa = useFieldArray({
    control,
    name: `components.${compIndex}.cards.${cardIndex}.components.${cardCompIndex}.buttons`,
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
          const typePath =
            `components.${compIndex}.cards.${cardIndex}.components.${cardCompIndex}.buttons.${i}.type` as const;
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
