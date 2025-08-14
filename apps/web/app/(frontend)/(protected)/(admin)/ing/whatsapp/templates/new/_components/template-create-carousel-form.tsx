/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  useFormContext,
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
import { Trash } from "lucide-react";
import { pruneObject } from "@/utils/prune";
import { LanguagesEnum } from "@workspace/wa-cloud-api";
import z from "zod";
import { toSnake } from "@/utils/string-helper";
import { parseNamed, parsePositional } from "../_lib/utils";
import { ErrorSummary } from "./helpers";
import { ButtonsArray } from "./template-button";
import { HeaderFileField } from "./template-header-file-field";
import { BodyAutoExamples } from "./template-body-examples";
import { BodyEditor } from "./template-body-editor";

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
      TemplateCarouselCreateSchema.parse(payload);

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
    onError: (error) => {
      if (error instanceof AxiosError) {
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
      }

      if (error instanceof z.ZodError) {
        //
        console.log(error);
      }
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
  index,
  parameterFormat,
  syncExamples,
}: {
  index: number;
  parameterFormat: "POSITIONAL" | "NAMED";
  syncExamples: (opts?: { bodyTextOverride?: string }) => void;
}) {
  const { control } = useFormContext();

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
            index={index}
            parameterFormat={parameterFormat}
            syncExamples={syncExamples}
          />
          <BodyAutoExamples index={index} parameterFormat={parameterFormat} />
        </>
      )}

      {type === "CAROUSEL" && <CarouselArray compIndex={index} />}
    </div>
  );
}

/* -----------------------------
 * Carousel: Cards & Components
 * --------------------------- */

function CarouselArray({ compIndex }: { compIndex: number }) {
  const { getValues, trigger, control } =
    useFormContext<TemplateCarouselCreateValue>();

  const fa = useFieldArray({
    control,
    name: `components.${compIndex}.cards`,
  });
  const handleAddCard = () => {
    const cards = getValues(`components.${compIndex}.cards`);
    const first = cards?.[0];
    if (first) {
      const firstHeader = first.components.find(
        (c: any) => c.type === "HEADER"
      );
      const firstButtons = first.components.find(
        (c: any) => c.type === "BUTTONS"
      );
      fa.append({
        components: [
          // @ts-expect-error firstHeader
          { type: "HEADER", format: firstHeader.format, text: "" },
          {
            type: "BUTTONS",
            // @ts-expect-error firstButtons
            buttons: (firstButtons.buttons as any[]).map((b) => ({
              type: b.type,
              text: "",
            })),
          },
        ],
      });
    } else {
      // fallback to some sensible initial structure
      fa.append({
        components: [
          {
            type: "HEADER",
            format: "IMAGE",
            example: {
              header_handle: [""],
            },
          },
          {
            type: "BUTTONS",
            buttons: [{ type: "QUICK_REPLY", text: "" }],
          },
        ],
      });
    }

    void trigger(`components.${compIndex}`);
  };

  const handleRemoveCard = (idx: number) => {
    fa.remove(idx);
    void trigger(`components.${compIndex}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">Cards</span>
        <Button type="button" variant="secondary" onClick={handleAddCard}>
          Add Card
        </Button>
      </div>

      {fa.fields.length === 0 && (
        <p className="text-xs text-muted-foreground">No Carousel.</p>
      )}

      <div className="space-y-3">
        {fa.fields.map((f, idx) => (
          <div key={f.id} className="border p-2 rounded relative">
            <ErrorSummary name={`components.${compIndex}.cards.${idx}`} />
            <CarouseComponentArray
              control={control}
              compIndex={compIndex}
              cardIndex={idx}
            />
            <div className="absolute top-2 right-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemoveCard(idx)}
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
      <HeaderFileField
        name={`components.${compIndex}.cards.${cardIndex}.components.${cardCompIndex}.example.header_handle.0`}
      />
    );
  }

  if (type === "BUTTONS") {
    return (
      <ButtonsArray
        prefix={`components.${compIndex}.cards.${cardIndex}`}
        index={cardCompIndex}
      />
    );
  }

  return null;
}
