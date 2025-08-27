 
"use client";

import { Button } from "@workspace/ui/components/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ButtonPositionEnum,
  ComponentTypesEnum,
  LanguagesEnum,
  SubTypeEnum,
  TemplateResponse,
} from "@workspace/wa-cloud-api";
import { useEffect } from "react";
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { TranslateTemplateResponseToMessageTemplate } from "@/app/(frontend)/(protected)/(admin)/ing/whatsapp/marketing-campaigns/new/_components/template-form/message-template-actions";

import { ComponentParametersArray } from "./message-template-component-parameter-array";

type Props = {
  initialTemplate?: TemplateResponse;
  namePrefix: string;
  preview?: boolean;
};

export function MessageTemplateForm({
  initialTemplate,
  namePrefix,
  preview = false,
}: Props) {
  const { control, setValue, watch } = useFormContext();

  const values = React.useMemo(
    () => (initialTemplate ? { ...initialTemplate } : undefined),
    [initialTemplate]
  );

  const defaultValue = React.useCallback(() => {
    if (values) return TranslateTemplateResponseToMessageTemplate(values);

    return {
      components: [],
      language: {
        code: LanguagesEnum.English,
        policy: "deterministic",
      },
      name: "",
    };
  }, [values]);

  const componentsPath = `${namePrefix}.components` as const;

  const { append, fields, remove, replace } = useFieldArray({
    control,
    name: componentsPath,
  });

  useEffect(() => {
    setValue(namePrefix, defaultValue());
    replace(defaultValue().components);
  }, [defaultValue, namePrefix, replace, setValue]);

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
            hidden={preview}
            onClick={() =>
              append({ parameters: [], type: ComponentTypesEnum.Body })
            }
            type="button"
          >
            Add Component
          </Button>
        </div>

        {fields.map((field, index) => {
          const fieldType = watch(`${componentsPath}.${index}.type`);
          return (
            <div className="border p-4 rounded-md space-y-4" key={field.id}>
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
                  hidden={preview}
                  onClick={() => remove(index)}
                  type="button"
                  variant="destructive"
                >
                  Remove
                </Button>
              </div>

              <p>{fieldType}</p>

              {fieldType === ComponentTypesEnum.Button && (
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
              )}

              {fieldType === "CAROUSEL" && (
                <>
                  <CarouselCards
                    prefix={`${componentsPath}.${index}`}
                    preview={preview}
                  />
                </>
              )}

              <ComponentParametersArray
                control={control}
                name={`${componentsPath}.${index}.parameters`}
                preview={preview}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CarouselCardComponents({
  prefix,
  preview = false,
}: {
  prefix: string;
  preview?: boolean;
}) {
  const { control, watch } = useFormContext();

  const componentsPath = `${prefix}.components` as const;

  const { fields, remove } = useFieldArray({
    control,
    name: componentsPath,
  });

  console.log(componentsPath);

  const componentTypes = Object.values(ComponentTypesEnum);
  const buttonTypes = Object.values(SubTypeEnum);
  const buttonPositions = Object.values(ButtonPositionEnum);

  return (
    <>
      {fields.map((field, index) => {
        const fieldType = watch(`${componentsPath}.${index}.type`);
        return (
          <div className="border p-4 rounded-md space-y-4" key={field.id}>
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
                hidden={preview}
                onClick={() => remove(index)}
                type="button"
                variant="destructive"
              >
                Remove
              </Button>
            </div>

            <p>{fieldType}</p>

            {fieldType === ComponentTypesEnum.Button && (
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
            )}

            <ComponentParametersArray
              control={control}
              name={`${componentsPath}.${index}.parameters`}
              preview={preview}
            />
          </div>
        );
      })}
    </>
  );
}
function CarouselCards({
  prefix,
  preview = false,
}: {
  prefix: string;
  preview?: boolean;
}) {
  const { control } = useFormContext();

  const cardsPath = `${prefix}.cards` as const;

  const { fields } = useFieldArray({
    control,
    name: cardsPath,
  });

  return (
    <>
      {fields.map((el, idx) => {
        <div key={idx}>
          <CarouselCardComponents
            prefix={`${cardsPath}.${idx}`}
            preview={preview}
          />
          Test
        </div>;
      })}
    </>
  );
}
