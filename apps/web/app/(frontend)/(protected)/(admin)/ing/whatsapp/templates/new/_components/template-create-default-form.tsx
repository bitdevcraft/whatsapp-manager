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
import { DevTool } from "@hookform/devtools";
import { useMutation } from "@tanstack/react-query";
import {
  TemplateCreateSchema,
  type TemplateCreateValue,
  defaultValue,
} from "@/types/validations/templates/template-schema";

import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { pruneObject } from "@/utils/prune";
import { ButtonsArray } from "./template-button";
import { BodyAutoExamples } from "./template-body-examples";
import { BodyEditor } from "./template-body-editor";
import { FooterEditor } from "./template-footer-editor";
import { toSnake } from "@/utils/string-helper";
import { parseNamed, parsePositional } from "../_lib/utils";
import { HeaderField } from "./template-header";
import { TemplateDetails } from "./template-details";

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
        removeEmptyStrings: true,
        trimStrings: true,
      });

      const indexOfType = (type: string) =>
        cleanPayload.components.findIndex((c) => c.type === type);

      const hIdx = indexOfType("HEADER");

      if (
        hIdx !== -1 &&
        !Object.hasOwn(cleanPayload.components[hIdx]!, "text") &&
        !Object.hasOwn(cleanPayload.components[hIdx]!, "example")
      ) {
        cleanPayload.components.splice(hIdx, 1);
      }

      const fIdx = indexOfType("FOOTER");

      if (
        fIdx !== -1 &&
        !Object.hasOwn(cleanPayload.components[fIdx]!, "text")
      ) {
        cleanPayload.components.splice(fIdx, 1);
      }

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

  const onSubmit = (values: TemplateCreateValue) => mutation.mutate(values);

  // Only allow adding BUTTONS
  const addButtons = () => {
    const comps = getValues("components");
    if (Array.isArray(comps) && comps.some((c: any) => c?.type === "BUTTONS")) {
      return; // already have one → do nothing
    }
    componentsFA.append({
      type: "BUTTONS",
      buttons: [{ type: "QUICK_REPLY", text: "Quick Reply" }],
    } as any);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <TemplateDetails />

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

            <div className="flex flex-wrap gap-2">
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
      <DevTool control={control} />
    </>
  );
}

function ComponentItem({
  index,
  parameterFormat,
  syncExamples,
}: {
  index: number;
  parameterFormat: "POSITIONAL" | "NAMED";
  syncExamples: (opts?: {
    headerTextOverride?: string;
    bodyTextOverride?: string;
  }) => void;
}) {
  const { control } = useFormContext();

  const type = useWatch({
    control,
    name: `components.${index}.type` as const,
  }) as "HEADER" | "BODY" | "FOOTER" | "BUTTONS";

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{type}</div>
      </div>

      {type === "HEADER" && (
        <HeaderField
          control={control}
          index={index}
          parameterFormat={parameterFormat}
          syncExamples={syncExamples}
        />
      )}

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

      {type === "FOOTER" && (
        <>
          <FooterEditor index={index} />
        </>
      )}

      {type === "BUTTONS" && (
        <>
          <ButtonsArray index={index} />
        </>
      )}
    </div>
  );
}
