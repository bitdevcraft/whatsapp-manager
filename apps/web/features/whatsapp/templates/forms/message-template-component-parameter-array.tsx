"use client";

import {
  ControllerRenderProps,
  FieldValues,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { Input } from "@workspace/ui/components/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { ParametersTypesEnum } from "@workspace/wa-cloud-api";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
} from "@workspace/ui/components/data-importer/file-upload";
import { Upload, X } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import axios from "axios";
import { MarketingCampaignFormSchema } from "@/features/marketing-campaigns/_lib/schema";
import { useMultiStepFormContext } from "@/components/forms/multi-step-form";

export function ComponentParametersArray({
  name,
  control,
  preview = false,
}: {
  name: string;
  control: any;
  preview?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({ name, control });

  const [fileRecord, setFileRecord] = React.useState<Record<string, File>>({});

  const { form } =
    useMultiStepFormContext<typeof MarketingCampaignFormSchema>();

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const onFileUpload = async (
    data: File[],
    field: ControllerRenderProps<FieldValues, `${string}.${number}.id`>
  ) => {
    const file = data[0];
    if (!file) return;

    setFileRecord((prev) => ({
      ...prev,
      [field.name]: file,
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        `/api/whatsapp/files/${form.getValues().details.phoneNumber}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      field.onChange(response.data.id);
    } catch (error) {}
  };

  // ✅ Watch all types at once outside the loop
  const types = useWatch({ control, name }) ?? [];

  return (
    <div className="space-y-2">
      {fields.map((field, i) => {
        const type = types[i]?.type;

        return (
          <div key={field.id} className="border p-3 rounded-md space-y-2">
            <FormField
              control={control}
              name={`${name}.${i}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger
                        className={
                          preview
                            ? `disabled:opacity-100 disabled:bg-background disabled:border-0 disabled:dark:bg-background disabled:font-semibold disabled:cursor-default`
                            : ``
                        }
                        disabled={preview}
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ParametersTypesEnum).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {type === ParametersTypesEnum.Text && (
              <FormField
                control={control}
                name={`${name}.${i}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter text" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {(type === ParametersTypesEnum.Image ||
              type === ParametersTypesEnum.Video ||
              type === ParametersTypesEnum.Document) && (
              <FormField
                control={control}
                name={`${name}.${i}.id`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      {/* <Input {...field} placeholder="Enter text" /> */}

                      <FileUpload
                        {...field}
                        maxSize={5 * 1024 * 1024}
                        className="w-full max-w-md mx-auto"
                        value={Object.values(fileRecord)}
                        onValueChange={(files) => onFileUpload(files, field)}
                        onFileReject={onFileReject}
                      >
                        <FileUploadDropzone>
                          <div className="flex flex-col items-center gap-1 text-center">
                            <div className="flex items-center justify-center rounded-full border p-2.5">
                              <Upload className="size-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium text-sm">
                              Drag & drop files here
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Or click to browse (max 2 files, up to 5MB each)
                            </p>
                          </div>
                          <FileUploadTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 w-fit"
                            >
                              Browse files
                            </Button>
                          </FileUploadTrigger>
                        </FileUploadDropzone>
                        <FileUploadList>
                          {Object.values(fileRecord).map((file, index) => (
                            <FileUploadItem key={index} value={file}>
                              <FileUploadItemPreview />
                              <FileUploadItemMetadata />
                              <FileUploadItemDelete asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                >
                                  <X />
                                </Button>
                              </FileUploadItemDelete>
                            </FileUploadItem>
                          ))}
                        </FileUploadList>
                      </FileUpload>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {type === ParametersTypesEnum.Currency && (
              <>
                <FormField
                  control={control}
                  name={`${name}.${i}.currency.fallback_value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fallback</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 100 USD" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`${name}.${i}.currency.code`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. USD" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`${name}.${i}.currency.amount_1000`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount x1000</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(i)}
              hidden={preview}
            >
              Remove Parameter
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            type: ParametersTypesEnum.Text,
          })
        }
        hidden={preview}
      >
        Add Parameter
      </Button>
    </div>
  );
}
