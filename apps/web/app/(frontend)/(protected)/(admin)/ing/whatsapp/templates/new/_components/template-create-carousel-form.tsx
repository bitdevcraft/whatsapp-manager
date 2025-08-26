/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Form } from "@workspace/ui/components/form";
import axios, { AxiosError } from "axios";
import { Trash, X } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import {
  TemplateCarouselCreateSchema,
  TemplateCarouselCreateValue,
  templateCarouselDefault,
} from "@/types/validations/templates/template-schema";
import { pruneObject } from "@/utils/prune";
import { toSnake } from "@/utils/string-helper";

import { parseNamed, parsePositional } from "../_lib/utils";
import { ErrorSummary } from "./helpers";
import { BodyEditor } from "./template-body-editor";
import { BodyAutoExamples } from "./template-body-examples";
import { ButtonsArray } from "./template-button";
import { TemplateDetails } from "./template-details";
import { HeaderFileField } from "./template-header-file-field";

/* -----------------------------
 * Component
 * --------------------------- */

export default function TemplateCarouselCreateForm({
  id,
  initialValues,
}: {
  id?: string;
  initialValues?: Partial<TemplateCarouselCreateValue>;
}) {
  const router = useRouter();

  const form = useForm<TemplateCarouselCreateValue>({
    defaultValues: { ...templateCarouselDefault, ...initialValues },
    mode: "onChange",
    resolver: zodResolver(TemplateCarouselCreateSchema),
    // important to reduce registration churn
    shouldUnregister: false,
  });

  const { control, getValues, handleSubmit, setValue } = form;

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
  }) as "NAMED" | "POSITIONAL";

  // Keep examples in sync with body text + parameter format
  const syncExamples = React.useCallback(
    ({ bodyTextOverride }: { bodyTextOverride?: string } = {}) => {
      const comps = getValues("components") as any[];
      const bIdx = comps.findIndex((c) => c?.type === "BODY");
      if (bIdx < 0) return;

      const pf = getValues("parameter_format") as "NAMED" | "POSITIONAL";
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
          ) as Array<{ example: string; param_name: string; }>) || [];
        const map = new Map(current.map((o) => [o.param_name, o.example]));
        const next =
          names.length === 0
            ? undefined
            : names.map((n) => ({ example: map.get(n) ?? "", param_name: n }));
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
        removeEmptyArrays: true,
        removeEmptyObjects: true,
        removeEmptyStrings: true,
        trimStrings: true,
      });

      const url = id
        ? `/api/whatsapp/templates/edit/${id}`
        : `/api/whatsapp/templates/create`;

      console.log(url);

      const result = await axios.post(url, cleanPayload);
      return result.data;
    },
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
    onSuccess: () => {
      toast.success("Saved");
      router.push("/ing/whatsapp/templates");
    },
  });

  const onSubmit = (values: TemplateCarouselCreateValue) =>
    mutation.mutate(values);

  return (
    <Form {...form}>
      <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
        <TemplateDetails />

        {/* Components */}
        <div className="space-y-3">
          {componentsFA.fields.length === 0 && (
            <p className="text-sm text-muted-foreground">No components.</p>
          )}
          <div className="space-y-4">
            {componentsFA.fields.map((comp, idx) => (
              <ComponentItem
                index={idx}
                key={comp.id}
                parameterFormat={parameterFormat}
                syncExamples={syncExamples}
              />
            ))}
          </div>
        </div>

        <Button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "Loading…" : "Submit"}
        </Button>
      </form>
    </Form>
  );
}

/* -----------------------------
 * ComponentItem: uses useWatch (no watch()) and no setValue during render
 * --------------------------- */

function CardComponentRenderer({
  cardCompIndex,
  cardIndex,
  compIndex,
  control,
}: {
  cardCompIndex: number;
  cardIndex: number;
  compIndex: number;
  control: any;
}) {
  const type = useWatch({
    control,
    name: `components.${compIndex}.cards.${cardIndex}.components.${cardCompIndex}.type` as const,
  }) as "BODY" | "BUTTONS" | "FOOTER" | "HEADER" | undefined;

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
        index={cardCompIndex}
        prefix={`components.${compIndex}.cards.${cardIndex}`}
      />
    );
  }

  return null;
}

/* -----------------------------
 * Carousel: Cards & Components
 * --------------------------- */

function CarouseComponentArray({
  cardIndex,
  compIndex,
  control,
}: {
  cardIndex: number;
  compIndex: number;
  control: any;
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
              cardCompIndex={idx}
              cardIndex={cardIndex}
              compIndex={compIndex}
              control={control}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CarouselArray({ compIndex }: { compIndex: number }) {
  const { control, getValues, trigger } =
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
          { format: firstHeader.format, text: "", type: "HEADER" },
          {
            // @ts-expect-error firstButtons
            buttons: (firstButtons.buttons as any[]).map((b) => ({
              text: "",
              type: b.type,
            })),
            type: "BUTTONS",
          },
        ],
      });
    } else {
      // fallback to some sensible initial structure
      fa.append({
        components: [
          {
            example: {
              header_handle: [""],
            },
            format: "IMAGE",
            type: "HEADER",
          },
          {
            buttons: [{ text: "", type: "QUICK_REPLY" }],
            type: "BUTTONS",
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
        <Button onClick={handleAddCard} type="button" variant="secondary">
          Add Card
        </Button>
      </div>

      {fa.fields.length === 0 && (
        <p className="text-xs text-muted-foreground">No Carousel.</p>
      )}

      <div className="space-y-3 flex overflow-y-scroll gap-4 py-8">
        {fa.fields.map((f, idx) => (
          <div
            className="border p-2 rounded relative min-w-[300] pt-6 shadow-xl"
            key={f.id}
          >
            <ErrorSummary name={`components.${compIndex}.cards.${idx}`} />
            <CarouseComponentArray
              cardIndex={idx}
              compIndex={compIndex}
              control={control}
            />
            <div className="absolute top-2 right-2">
              <Button
                className=""
                onClick={() => handleRemoveCard(idx)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <X className="text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComponentItem({
  index,
  parameterFormat,
  syncExamples,
}: {
  index: number;
  parameterFormat: "NAMED" | "POSITIONAL";
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
