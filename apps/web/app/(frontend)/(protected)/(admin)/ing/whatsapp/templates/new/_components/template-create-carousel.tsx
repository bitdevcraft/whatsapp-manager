/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  ControllerRenderProps,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

import {
  TemplateCarouselCreateSchema,
  TemplateCarouselCreateValue,
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
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
} from "@workspace/ui/components/data-importer/file-upload";
import { Upload, Trash } from "lucide-react";
import { pruneObject } from "@/utils/prune";
import { LanguagesEnum } from "@workspace/wa-cloud-api";

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

// {{name}} {{email}} → ["name","email"]
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
  placeCursorAt?: number
) {
  if (!el) return current + insertion;
  const start = el.selectionStart ?? current.length;
  const end = el.selectionEnd ?? current.length;
  const newValue = current.slice(0, start) + insertion + current.slice(end);
  queueMicrotask(() => {
    const nextPos = placeCursorAt ?? start + insertion.length;
    try {
      el.setSelectionRange(nextPos, nextPos);
      el.focus();
    } catch {
      /* noop */
    }
  });
  return newValue;
}

/* -----------------------------
 * Upload helpers (shared)
 * --------------------------- */

async function onHeaderFileUpload(
  data: File[],
  field: ControllerRenderProps<any, any>
) {
  const file = data[0];
  if (!file) return;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`/api/whatsapp/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const { h } = response.data;
    field.onChange(h);
  } catch (err: any) {
    toast.error(err?.message ?? "Upload error");
  }
}

const onFileReject = (file: File, message: string) => {
  toast(message, {
    description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
  });
};

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
    // important to reduce registration churn
    shouldUnregister: false,
  });

  const { control, handleSubmit, setValue, getValues } = form;

  const componentsFA = useFieldArray({ control, name: "components" });

  // Enforce snake_case for name
  const nameVal = useWatch({ control, name: "name" });
  React.useEffect(() => {
    if (typeof nameVal === "string") {
      const snake = toSnake(nameVal);
      if (snake !== nameVal) setValue("name", snake, { shouldDirty: true });
    }
  }, [nameVal, setValue]);

  const parameterFormat = useWatch({
    control,
    name: "parameter_format",
  }) as "POSITIONAL" | "NAMED";

  // Keep examples in sync with body text + parameter format
  const syncExamples = React.useCallback(
    ({ bodyTextOverride }: { bodyTextOverride?: string } = {}) => {
      const comps = getValues("components") as any[];
      const bIdx = comps.findIndex((c) => c?.type === "BODY");
      if (bIdx < 0) return;

      const pf = getValues("parameter_format") as "POSITIONAL" | "NAMED";
      const bText = bodyTextOverride ?? getValues(`components.${bIdx}.text`);

      // reset both
      setValue(`components.${bIdx}.example.body_text`, undefined, {
        shouldDirty: true,
      });
      setValue(`components.${bIdx}.example.body_text_named_params`, undefined, {
        shouldDirty: true,
      });

      if (pf === "POSITIONAL") {
        const nums = parsePositional(bText);
        const current = getValues(`components.${bIdx}.example.body_text`) as
          | string[][]
          | undefined;
        const prevRow = current?.[0] ?? [];
        const row =
          nums.length === 0
            ? undefined
            : [
                Array.from(
                  { length: nums.length },
                  (_, i) => prevRow?.[i] ?? ""
                ),
              ];
        setValue(`components.${bIdx}.example.body_text`, row, {
          shouldDirty: true,
        });
      } else {
        const names = parseNamed(bText);
        const current =
          (getValues(
            `components.${bIdx}.example.body_text_named_params`
          ) as Array<{ param_name: string; example: string }>) || [];
        const map = new Map(current.map((o) => [o.param_name, o.example]));
        const next =
          names.length === 0
            ? undefined
            : names.map((n) => ({ param_name: n, example: map.get(n) ?? "" }));
        setValue(`components.${bIdx}.example.body_text_named_params`, next, {
          shouldDirty: true,
        });
      }
    },
    [getValues, setValue]
  );

  // keep examples in sync after mount and when param format changes
  React.useEffect(() => {
    syncExamples();
  }, [syncExamples, parameterFormat]);

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
      const title =
        (error.response?.data as any)?.error?.error?.error_user_title ??
        "Error";
      const msg =
        (error.response?.data as any)?.error?.error?.error_user_msg ??
        error.message;
      toast.error(
        <div>
          <p className="text-xl">{title}</p>
          <p className="font-light">{msg}</p>
        </div>
      );
    },
  });

  const onSubmit = (values: TemplateCarouselCreateValue) =>
    mutation.mutate(values);

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

          {/* language */}
          <FormField
            control={control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(v) => field.onChange(v)}
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

        {/* Components */}
        <div className="space-y-3">
          {componentsFA.fields.length === 0 && (
            <p className="text-sm text-muted-foreground">No components.</p>
          )}
          <div className="space-y-4">
            {componentsFA.fields.map((comp, idx) => (
              <ComponentItem
                key={comp.id}
                control={control}
                index={idx}
                parameterFormat={parameterFormat}
                syncExamples={syncExamples}
              />
            ))}
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
 * ComponentItem: uses useWatch (no watch()) and no setValue during render
 * --------------------------- */

function ComponentItem({
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
  const type = useWatch({
    control,
    name: `components.${index}.type` as const,
  }) as "BODY" | "CAROUSEL";

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{type}</div>
      </div>

      {type === "BODY" && (
        <>
          <BodyEditor
            control={control}
            index={index}
            parameterFormat={parameterFormat}
            syncExamples={syncExamples}
          />
          <BodyAutoExamples
            control={control}
            index={index}
            parameterFormat={parameterFormat}
          />
        </>
      )}

      {type === "CAROUSEL" && (
        <CarouselArray control={control} compIndex={index} />
      )}
    </div>
  );
}

/* -----------------------------
 * BODY editor (input + Add Variable button)
 * --------------------------- */

function BodyEditor({
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
      render={({ field }) => {
        const inputRef = React.useRef<HTMLInputElement>(null);

        const onAddVariable = () => {
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
          const next = insertAtCursor(
            inputRef.current,
            current,
            insertion,
            start
          );
          field.onChange(next);
          syncExamples({ bodyTextOverride: next });
        };

        return (
          <FormItem>
            <FormLabel>Body Text</FormLabel>
            <FormControl>
              <Input
                {...field}
                ref={(el) => {
                  field.ref(el);
                  (inputRef as any).current = el;
                }}
                placeholder="e.g. Dear {{1}} or Dear {{name}}"
                onChange={(e) => {
                  const val = e.target.value as string;
                  field.onChange(val);
                  syncExamples({ bodyTextOverride: val });
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
  );
}

/* -----------------------------
 * Subcomponents: Auto Examples
 * --------------------------- */

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

function AutoMatrixRowInputs({
  control,
  baseName,
  label,
}: {
  control: any;
  baseName: string; // e.g. components.X.example.body_text.0
  label: string;
}) {
  const arr = useWatch({
    control,
    name: baseName as any,
  }) as string[] | undefined;

  const len = Array.isArray(arr) ? arr.length : 0;
  if (!len) return null;

  return (
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
  );
}

function AutoNamedParamsInputs({
  control,
  baseName,
  label,
}: {
  control: any;
  baseName: string; // e.g. components.X.example.body_text_named_params
  label: string;
}) {
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

/* -----------------------------
 * Carousel: Cards & Components
 * --------------------------- */

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
                  example: { header_handle: [""] },
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
        {fa.fields.map((f, idx) => (
          <div key={f.id} className="border p-2 rounded relative">
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
        ))}
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
  const prefix =
    `components.${compIndex}.cards.${cardIndex}.components` as const;

  const fa = useFieldArray({
    control,
    name: prefix,
  });

  return (
    <div className="space-y-2">
      {fa.fields.length === 0 && (
        <p className="text-xs text-muted-foreground">No Carousel.</p>
      )}
      <div className="space-y-3">
        {fa.fields.map((f, idx) => (
          <div key={f.id}>
            <CardComponentRenderer
              control={control}
              compIndex={compIndex}
              cardIndex={cardIndex}
              cardCompIndex={idx}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CardComponentRenderer({
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
  const type = useWatch({
    control,
    name: `components.${compIndex}.cards.${cardIndex}.components.${cardCompIndex}.type` as const,
  }) as "HEADER" | "BODY" | "FOOTER" | "BUTTONS" | undefined;

  if (type === "HEADER") {
    return (
      <FormField
        control={control}
        name={`components.${compIndex}.cards.${cardIndex}.components.${cardCompIndex}.example.header_handle.0`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Image</FormLabel>
            <FormControl>
              <FileUpload
                maxSize={5 * 1024 * 1024}
                className="w-full max-w-md mx-auto"
                onValueChange={(files) => onHeaderFileUpload(files, field)}
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
                      Or click to browse (max 5MB)
                    </p>
                  </div>
                  <FileUploadTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2 w-fit">
                      Browse files
                    </Button>
                  </FileUploadTrigger>
                </FileUploadDropzone>
              </FileUpload>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (type === "BUTTONS") {
    return (
      <CarouselButtonsArray
        control={control}
        compIndex={compIndex}
        cardIndex={cardIndex}
        cardCompIndex={cardCompIndex}
      />
    );
  }

  return null; // BODY/FOOTER not used in CAROUSEL
}

/* -----------------------------
 * Buttons array (manual add/remove)
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
  const base =
    `components.${compIndex}.cards.${cardIndex}.components.${cardCompIndex}` as const;

  const fa = useFieldArray({
    control,
    name: `${base}.buttons` as const,
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
        {fa.fields.map((f, i) => (
          <ButtonRow
            key={f.id}
            control={control}
            base={base}
            index={i}
            remove={() => fa.remove(i)}
            types={types}
          />
        ))}
      </div>
    </div>
  );
}

function ButtonRow({
  control,
  base,
  index,
  remove,
  types,
}: {
  control: any;
  base: string;
  index: number;
  remove: () => void;
  types: readonly ["QUICK_REPLY", "URL", "PHONE_NUMBER"];
}) {
  const typePath = `${base}.buttons.${index}.type` as const;
  const typeValue = useWatch({ control, name: typePath }) as
    | "QUICK_REPLY"
    | "URL"
    | "PHONE_NUMBER"
    | undefined;

  return (
    <div className="grid grid-cols-1 gap-2 rounded-md border p-2">
      <FormField
        control={control}
        name={typePath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
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
        name={`${base}.buttons.${index}.text`}
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
        <Button type="button" variant="destructive" onClick={remove}>
          Remove
        </Button>
      </div>
    </div>
  );
}
