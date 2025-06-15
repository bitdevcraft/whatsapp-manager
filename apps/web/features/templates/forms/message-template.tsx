"use client";

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
import { Button } from "@workspace/ui/components/button";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import {
  ButtonPositionEnum,
  ButtonTypesEnum,
  ComponentTypesEnum,
  LanguagesEnum,
  TemplateResponse,
} from "@workspace/wa-cloud-api/types";
import { ComponentParametersArray } from "./message-template-component-parameter-array";
import { ComponentButtonParameter } from "./message-template-component-button-parameter";
import { transformTemplateResponseToFormValues } from "./message-template-actions";
import { useEffect, useMemo } from "react";

type Props = {
  form: UseFormReturn<any>;
  namePrefix: string;
  initialTemplate?: TemplateResponse;
};

export function MessageTemplateForm({
  form,
  namePrefix,
  initialTemplate,
}: Props) {
  const { control, watch, setValue } = form;

  const defaultValues = useMemo(() => {
    if (initialTemplate) {
      return transformTemplateResponseToFormValues(initialTemplate);
    }
    return {
      name: "",
      language: {
        policy: "deterministic",
        code: LanguagesEnum.English,
      },
      components: [],
    };
  }, [initialTemplate]);

  // ⚠️ Patch values into existing form on load
  useEffect(() => {
    if (initialTemplate) {
      setValue(namePrefix as any, defaultValues);
    }
  }, [initialTemplate, setValue, namePrefix, defaultValues]);

  const componentsFieldPath = `${namePrefix}.components` as const;

  const { fields, append, remove } = useFieldArray({
    control,
    name: componentsFieldPath,
  });

  const componentTypes = Object.values(ComponentTypesEnum);
  const languageOptions = Object.values(LanguagesEnum);
  const buttonTypes = Object.values(ButtonTypesEnum);
  const buttonPositions = Object.values(ButtonPositionEnum);

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name={`${namePrefix}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Template Name</FormLabel>
            <FormControl>
              <Input placeholder="Template name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${namePrefix}.language.code`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Language</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Components</h3>
          <Button
            type="button"
            onClick={() =>
              append({ type: ComponentTypesEnum.Body, parameters: [] })
            }
          >
            Add Component
          </Button>
        </div>

        {fields.map((field, index) => {
          const typePath = `${componentsFieldPath}.${index}.type` as const;
          const fieldType = watch(typePath);

          return (
            <div key={field.id} className="border p-4 rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <FormField
                  control={control}
                  name={typePath}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                >
                  Remove
                </Button>
              </div>

              {fieldType === ComponentTypesEnum.Button && (
                <>
                  <FormField
                    control={control}
                    name={`${componentsFieldPath}.${index}.sub_type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Sub Type</FormLabel>
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
                    name={`${componentsFieldPath}.${index}.index`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Index</FormLabel>
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

              {fieldType !== ComponentTypesEnum.Button ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Parameters</h4>
                  <ComponentParametersArray
                    name={`${componentsFieldPath}.${index}.parameters`}
                    control={control}
                  />
                </div>
              ) : (
                <ComponentButtonParameter
                  name={`${componentsFieldPath}.${index}.parameters`}
                  control={control}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
