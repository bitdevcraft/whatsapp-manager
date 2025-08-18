import { LanguagesEnum, TemplateResponse } from "@workspace/wa-cloud-api";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { TranslateTemplateResponseToMessageTemplate } from "./message-template-actions";
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import index from "swr";

interface Props {
  prefix: string;
  initialValue?: TemplateResponse;
}

export function MessageTemplateForm({ ...props }: Props) {
  const { control, setValue } = useFormContext();

  const values = React.useMemo(
    () => (props.initialValue ? { ...props.initialValue } : undefined),
    [props.initialValue]
  );

  const defaultValue = React.useCallback(() => {
    if (values) return TranslateTemplateResponseToMessageTemplate(values);

    return {
      name: "",
      language: {
        policy: "deterministic",
        code: LanguagesEnum.English,
      },
    };
  }, [values]);

  useEffect(() => {
    setValue(props.prefix, defaultValue());
  }, [defaultValue, props.prefix, setValue]);

  return <></>;
}

export function MessageTemplateNameField({
  prefix,
  preview = false,
}: {
  prefix: string;
  preview?: boolean;
}) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={`${prefix}.name`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Template Name</FormLabel>
          <FormControl>
            <Input
              placeholder="Template Name"
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
  );
}
