"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { CategoryEnum, LanguagesEnum } from "@workspace/wa-cloud-api";
import { SimpleTemplateSchema, SimpleTemplateValues } from "../_lib/validation";
import { toast } from "sonner";

// (Helper) TitleCase for fallback labels
function titleCase(s: string) {
  return s
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

type Props = {
  initialValues?: Partial<SimpleTemplateValues>;
};

export default function SimpleTemplateForm({ initialValues }: Props) {
  const form = useForm<SimpleTemplateValues>({
    resolver: zodResolver(SimpleTemplateSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      // leave selects undefined so the user must choose
      category: undefined as unknown as SimpleTemplateValues["category"],
      language: {
        policy: "deterministic",
        code: undefined as unknown as SimpleTemplateValues["language"]["code"],
      },
      body: "",
      buttons: [],
      ...initialValues,
    },
  });

  const { control, handleSubmit, watch } = form;

  const {
    fields: buttonFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "buttons",
  });

  const mutation = useMutation({
    mutationFn: async (payload: SimpleTemplateValues) => {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Request failed");
      }
      return (await res.json()) as { ok: boolean };
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

  const onSubmit = (values: SimpleTemplateValues) => mutation.mutate(values);

  // enum options
  const categoryOptions = React.useMemo(
    () =>
      Object.values(CategoryEnum).filter(
        (v): v is CategoryEnum => typeof v === "string"
      ),
    []
  );
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
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{titleCase("name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="Template name"
                  {...field}
                  onChange={(e) => {
                    const snake = e.target.value
                      .replace(/\s+/g, "_") // spaces → underscores
                      .replace(/([a-z])([A-Z])/g, "$1_$2") // camelCase → snake_case
                      .replace(/[^a-zA-Z0-9_]/g, "") // remove invalid chars
                      .toLowerCase();
                    field.onChange(snake);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row gap-2 w-full">
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{titleCase("category")}</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(v) => field.onChange(v)}
                    defaultValue={field.value as unknown as string | undefined}
                    value={field.value as unknown as string | undefined}
                  >
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
            name="language.code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{titleCase("language code")}</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(v) => field.onChange(v)}
                    defaultValue={field.value as unknown as string | undefined}
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
        </div>

        <FormField
          control={control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{titleCase("body")}</FormLabel>
              <FormControl>
                <Textarea placeholder="Body text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{titleCase("buttons")}</span>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                append({
                  type: "QUICK_REPLY",
                  text: "",
                  url: undefined,
                  phone_number: undefined,
                })
              }
            >
              Add Button
            </Button>
          </div>

          {buttonFields.length === 0 && (
            <p className="text-sm text-muted-foreground">No buttons added.</p>
          )}

          <div className="space-y-4">
            {buttonFields.map((fieldItem, idx) => {
              const typeValue = watch(`buttons.${idx}.type`);
              return (
                <div
                  key={fieldItem.id}
                  className="grid grid-cols-1 gap-3 rounded-lg border p-3"
                >
                  <Controller
                    control={control}
                    name={`buttons.${idx}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{titleCase("type")}</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(v) => field.onChange(v)}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {["URL", "PHONE_NUMBER", "QUICK_REPLY"].map(
                                (opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`buttons.${idx}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{titleCase("text")}</FormLabel>
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
                      name={`buttons.${idx}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{titleCase("url")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {typeValue === "PHONE_NUMBER" && (
                    <FormField
                      control={control}
                      name={`buttons.${idx}.phone_number`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{titleCase("phone_number")}</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 555 555 5555" {...field} />
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
                      onClick={() => remove(idx)}
                    >
                      Remove
                    </Button>
                  </div>
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
  );
}
