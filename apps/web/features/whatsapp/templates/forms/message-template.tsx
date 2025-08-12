/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import {
  ButtonPositionEnum,
  ComponentTypesEnum,
  LanguagesEnum,
  SubTypeEnum,
  TemplateResponse,
} from "@workspace/wa-cloud-api";
import {
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { ComponentParametersArray } from "./message-template-component-parameter-array";
import { transformTemplateResponseToFormValues } from "./message-template-actions";
import { logger } from "@/lib/logger";

type Props = {
  form: UseFormReturn<any>;
  namePrefix: string;
  initialTemplate?: TemplateResponse;
  preview?: boolean;
};

export function MessageTemplateForm({
  form,
  namePrefix,
  initialTemplate,
  preview = false,
}: Props) {
  const { control, setValue, watch } = form;

  logger.log("watched lang code", watch(`${namePrefix}.language.code`));

  const defaultValues = useMemo(() => {
    return initialTemplate
      ? transformTemplateResponseToFormValues(initialTemplate)
      : {
          name: "",
          language: {
            policy: "deterministic",
            code: LanguagesEnum.English,
          },
          components: [],
        };
  }, [initialTemplate]);

  const componentsPath = `${namePrefix}.components` as const;

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: componentsPath,
  });

  // 🔁 When template changes, replace all values & trigger re-render
  useEffect(() => {
    if (initialTemplate) {
      setValue(`${namePrefix}.name`, defaultValues.name);

      setValue(`${namePrefix}.language.code`, defaultValues.language.code);

      replace(defaultValues.components);

      form.reset({
        ...form.getValues(),
      });
    }
  }, [initialTemplate, namePrefix, setValue, replace, defaultValues]);

  const componentTypes = Object.values(ComponentTypesEnum);
  const languageOptions = Object.values(LanguagesEnum);
  const buttonTypes = Object.values(SubTypeEnum);
  const buttonPositions = Object.values(ButtonPositionEnum);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <FormField
          control={control}
          name={`${namePrefix}.name`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel
                className={preview ? `font-light text-muted-foreground` : ""}
              >
                Template Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Template name"
                  {...field}
                  className={
                    preview
                      ? `disabled:opacity-100 disabled:bg-background disabled:border-0 disabled:dark:bg-background disabled:font-semibold  disabled:cursor-default`
                      : ``
                  }
                  disabled={preview}
                  readOnly={preview}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${namePrefix}.language.code`}
          render={({ field }) => (
            <FormItem className="basis-1/6">
              <FormLabel
                className={preview ? `font-light text-muted-foreground` : ""}
              >
                Language
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    className={
                      preview
                        ? `disabled:opacity-100 disabled:bg-background disabled:border-0 disabled:dark:bg-background disabled:font-semibold  disabled:cursor-default`
                        : ``
                    }
                    disabled={preview}
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Components</h3>
          <Button
            type="button"
            onClick={() =>
              append({ type: ComponentTypesEnum.Body, parameters: [] })
            }
            hidden={preview}
          >
            Add Component
          </Button>
        </div>

        {fields.map((field, index) => {
          const fieldType = watch(`${componentsPath}.${index}.type`);
          return (
            <div key={field.id} className="border p-4 rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <FormField
                  control={control}
                  name={`${componentsPath}.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className={
                          preview ? `font-light text-muted-foreground` : ""
                        }
                      >
                        Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={
                              preview
                                ? `disabled:opacity-100 disabled:bg-background disabled:border-0 disabled:dark:bg-background disabled:font-semibold  disabled:cursor-default`
                                : ``
                            }
                            disabled={preview}
                          >
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {componentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                  hidden={preview}
                >
                  Remove
                </Button>
              </div>

              {fieldType === ComponentTypesEnum.Button ? (
                <>
                  <FormField
                    control={control}
                    name={`${componentsPath}.${index}.sub_type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className={
                            preview ? `font-light text-muted-foreground` : ""
                          }
                        >
                          Button Sub Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {buttonTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`${componentsPath}.${index}.index`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className={
                            preview ? `font-light text-muted-foreground` : ""
                          }
                        >
                          Button Index
                        </FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(parseInt(v))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select index" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {buttonPositions.map((pos, idx) => (
                              <SelectItem key={pos} value={idx.toString()}>
                                {pos}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <ComponentParametersArray
                  name={`${componentsPath}.${index}.parameters`}
                  control={control}
                  preview={preview}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
