"use client";

import {
  ComponentTypesEnum,
  LanguagesEnum,
  TemplateResponse,
} from "@workspace/wa-cloud-api";
import { useEffect } from "react";
import {
  ControllerRenderProps,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { LoaderCircle, Upload, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel";
import { usePreviewStore } from "./message-template-store";
import {
  FileUpload,
  FileUploadClear,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@workspace/ui/components/data-importer/file-upload";
import { onWhatsAppMediaFileUpload } from "./message-template-utils";
import { Button } from "@workspace/ui/components/button";
import { startTask } from "better-auth/react";
import { toast } from "sonner";

interface Props {
  prefix: string;
  initialValue?: TemplateResponse;
  preview?: boolean;
}

export function MessageTemplateFormV2({
  prefix,
  initialValue,
  preview = false,
}: Props) {
  const { setValue, control, getValues } = useFormContext();

  const values = React.useMemo(
    () => (initialValue ? { ...initialValue } : undefined),
    [initialValue]
  );

  const setPreview = usePreviewStore((state) => state.setPreview);

  const defaultValue = React.useCallback(() => {
    if (values) return TranslateTemplateResponseToMessageTemplate(values);

    return {
      name: "",
      language: {
        policy: "deterministic",
        code: LanguagesEnum.English,
      },
      components: [],
    };
  }, [values]);

  const componentsFA = useFieldArray({
    control,
    name: `${prefix}.components` as const,
  });

  useEffect(() => {
    setPreview(preview);
    setValue(prefix, defaultValue());

    componentsFA.replace(defaultValue().components);

    console.log(JSON.stringify(getValues()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, prefix, setValue, values]);

  return (
    <>
      {/* <Switch
        id="airplane-mode"
        onCheckedChange={(checked) => setPreview(checked)}
      /> */}

      <MessageTemplateNameField prefix={`${prefix}`} />
      <MessageTemplateLanguageCodeField prefix={`${prefix}`} />

      {componentsFA.fields.length === 0 && <p>No Components</p>}

      {componentsFA.fields.map((comp, idx) => (
        <div key={comp.id}>
          <MessageTemplateComponentItemField
            prefix={`${prefix}.components.${idx}`}
          />
        </div>
      ))}
    </>
  );
}

export function MessageTemplateNameField({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const preview = usePreviewStore((state) => state.preview);

  return (
    <FormField
      control={control}
      name={`${prefix}.name` as const}
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

export function MessageTemplateLanguageCodeField({
  prefix,
}: {
  prefix: string;
}) {
  const { control } = useFormContext();
  const languageOptions = Object.values(LanguagesEnum);
  const preview = usePreviewStore((state) => state.preview);

  return (
    <FormField
      control={control}
      name={`${prefix}.language.code` as const}
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
  );
}

export function MessageTemplateComponentItemField({
  prefix,
}: {
  prefix: string;
}) {
  const preview = usePreviewStore((state) => state.preview);

  const componentTypes = Object.values(ComponentTypesEnum);

  const { control } = useFormContext();

  const type = useWatch({
    control,
    name: `${prefix}.type` as const,
  }) as string;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!preview && (
          <FormField
            control={control}
            name={`${prefix}.type` as const}
            render={({ field }) => (
              <FormItem className="flex gap-4">
                <FormLabel className={preview ? `hidden` : ""}>Type</FormLabel>
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
        )}

        <MessageTemplateComponentItemParameters prefix={prefix} />
        <MessageTemplateComponentItemCards prefix={prefix} />
      </CardContent>
    </Card>
  );
}

export function MessageTemplateComponentItemParameters({
  prefix,
}: {
  prefix: string;
}) {
  const { control } = useFormContext();

  const parametersFA = useFieldArray({
    control,
    name: `${prefix}.parameters` as const,
  });

  if (parametersFA.fields.length === 0) return null;

  return (
    <ul className="space-y-4">
      {parametersFA.fields.map((parameter, idx) => (
        <li key={parameter.id}>
          <MessageTemplateComponentItemParameterItem
            prefix={`${prefix}.parameters.${idx}`}
            index={idx}
          />
        </li>
      ))}
    </ul>
  );
}

export function MessageTemplateComponentItemParameterItem({
  prefix,
  index,
}: {
  prefix: string;
  index: number;
}) {
  const { control } = useFormContext();

  const type = useWatch({ control, name: `${prefix}.type` });
  const parameterName = useWatch({ control, name: `${prefix}.parameter_name` });

  return (
    <>
      {type === "TEXT" && (
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-2">{`{{${parameterName ?? index + 1}}}`}</div>
          <div className="col-span-10">
            <MessageTemplateComponentItemParameterTextType
              prefix={`${prefix}`}
            />
          </div>
        </div>
      )}
      {(type === "IMAGE" || type === "VIDEO" || type === "DOCUMENT") && (
        <MessageTemplateComponentItemParameterMediaType
          prefix={prefix}
          mediaType={type}
        />
      )}
    </>
  );
}

export function MessageTemplateComponentItemParameterTextType({
  prefix,
}: {
  prefix: string;
}) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={`${prefix}.text`}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input placeholder="Enter New Value" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function MessageTemplateComponentItemParameterMediaType({
  prefix,
  mediaType,
}: {
  prefix: string;
  mediaType: "IMAGE" | "VIDEO" | "DOCUMENT";
}) {
  const { control } = useFormContext();

  const phoneNumber = useWatch({ control, name: "details.phoneNumber" });

  const fileClearRef = React.useRef<HTMLButtonElement>(null);

  const mediaPath = `${prefix}.${mediaType.toLowerCase()}`;

  const [files, setFiles] = React.useState<File[]>([]);

  const [isPending, startTransition] = React.useTransition();

  const onUpload = async (
    data: File[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: ControllerRenderProps<any, any>
  ) => {
    setFiles([]);
    startTransition(async () => {
      if (data.length > 0) {
        const valid = await onWhatsAppMediaFileUpload(
          data,
          phoneNumber,
          field,
          mediaType
        );
        if (valid) setFiles(() => [...data]);
      }
    });
  };

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const onFileValidate = React.useCallback(
    (file: File): string | null => {
      // Validate max files
      if (files.length >= 1) {
        return "You can only upload up to 1 files";
      }

      const isValid = (() => {
        switch (mediaType) {
          case "IMAGE":
            return file.type.startsWith("image/");
          case "VIDEO":
            return file.type.startsWith("video/");
          case "DOCUMENT":
            // allow common doc mimetypes (pdf, docx, etc.)
            return (
              file.type === "application/pdf" ||
              file.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
              file.type === "application/msword" ||
              file.type === "application/vnd.ms-excel" ||
              file.type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
          default:
            return false;
        }
      })();

      if (!isValid) {
        return `Only ${mediaType} files are allowed`;
      }

      // Validate file size (max 2MB)
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_SIZE) {
        return `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`;
      }

      return null;
    },
    [files, mediaType]
  );

  const onDelete = React.useCallback(() => {
    setFiles([]);
  }, []);

  return (
    <>
      <FormField
        control={control}
        name={`${mediaPath}.id`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Image</FormLabel>
            <FormControl>
              <FileUpload
                value={files}
                onValueChange={(next) => {
                  onUpload(next, field);
                }}
                maxSize={5 * 1024 * 1024}
                className="w-full max-w-sm mx-auto relative"
                onFileReject={onFileReject}
                onFileValidate={onFileValidate}
              >
                {isPending && (
                  <div className="absolute z-99 size-full bg-background/50 rounded"></div>
                )}
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
                {/* ✅ The list is back */}
                <FileUploadList>
                  {files.map((file, i) => (
                    <FileUploadItem key={`${file.name}-${i}`} value={file}>
                      <FileUploadItemPreview />
                      <FileUploadItemMetadata />
                      <FileUploadItemDelete asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={onDelete}
                        >
                          <X />
                        </Button>
                      </FileUploadItemDelete>
                    </FileUploadItem>
                  ))}
                </FileUploadList>
                <FileUploadClear />
              </FileUpload>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {mediaType === "DOCUMENT" && (
        <FormField
          control={control}
          name={`${mediaPath}.filename`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>FileName</FormLabel>
              <FormControl>
                <Input {...field} placeholder="" />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </>
  );
}

export function MessageTemplateComponentItemCards({
  prefix,
}: {
  prefix: string;
}) {
  const { control } = useFormContext();
  const preview = usePreviewStore((state) => state.preview);

  const cardsFA = useFieldArray({ control, name: `${prefix}.cards` as const });

  if (cardsFA.fields.length === 0) return null;

  return (
    <Carousel>
      <CarouselContent>
        {cardsFA.fields.map((card, idx) => (
          <CarouselItem key={card.id} className="basis-3/4">
            <MessageTemplateComponentItemCardComponent
              prefix={`${prefix}.cards.${idx}`}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export function MessageTemplateComponentItemCardComponent({
  prefix,
}: {
  prefix: string;
}) {
  const { control } = useFormContext();
  const componentsFA = useFieldArray({
    control,
    name: `${prefix}.components` as const,
  });

  return (
    <>
      {componentsFA.fields.map((comp, idx) => (
        <div key={comp.id}>
          <MessageTemplateComponentItemField
            prefix={`${prefix}.components.${idx}`}
          />
        </div>
      ))}
    </>
  );
}
