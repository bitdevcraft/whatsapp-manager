"use client";

import {
  Form,
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
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import { useMemo } from "react";
import {
  ButtonPositionEnum,
  SubTypeEnum,
  ComponentTypesEnum,
  LanguagesEnum,
  TemplateResponse,
} from "@workspace/wa-cloud-api";
import { MessageTemplateSchema, MessageTemplateValues } from "../lib/schema";
import { ComponentParametersArray } from "./message-template-component-parameter-array";
import { ComponentButtonParameter } from "./message-template-component-button-parameter";
import { transformTemplateResponseToFormValues } from "./message-template-actions";
import { logger } from "@/lib/logger";

type Props = {
  initialTemplate?: TemplateResponse;
};

export function MessageTemplateForm({ initialTemplate }: Props) {
  const defaultValues = useMemo<MessageTemplateValues>(() => {
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

  const form = useForm<MessageTemplateValues>({
    resolver: zodResolver(MessageTemplateSchema),
    defaultValues,
  });

  const { control, handleSubmit, watch } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "components",
  });

  const onSubmit = (data: MessageTemplateValues) => {
    logger.log("Form submitted:", data);
  };

  const componentTypes = Object.values(ComponentTypesEnum);
  const languageOptions = Object.values(LanguagesEnum);
  const buttonTypes = Object.values(SubTypeEnum);
  const buttonPositions = Object.values(ButtonPositionEnum);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={control}
          name="name"
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
          name="language.code"
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
            const fieldType = watch(`components.${index}.type`);

            return (
              <div key={field.id} className="border p-4 rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <FormField
                    control={control}
                    name={`components.${index}.type`}
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
                      name={`components.${index}.sub_type`}
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
                      name={`components.${index}.index`}
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
                      name={`components.${index}.parameters`}
                      control={control}
                    />
                  </div>
                ) : (
                  <ComponentButtonParameter
                    name={`components.${index}.parameters`}
                    control={control}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
