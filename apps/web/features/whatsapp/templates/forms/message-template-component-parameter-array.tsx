/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@workspace/ui/components/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@workspace/ui/components/data-importer/file-upload";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { ParametersTypesEnum } from "@workspace/wa-cloud-api";
import axios from "axios";
import { Upload, X } from "lucide-react";
import React from "react";
import {
  ControllerRenderProps,
  FieldValues,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";

import { useMultiStepFormContext } from "@/components/forms/multi-step-form";
import { MarketingCampaignFormSchema } from "@/features/marketing-campaigns/_lib/schema";

export function ComponentParametersArray({
  control,
  name,
  preview = false,
}: {
  control: any;
  name: string;
  preview?: boolean;
}) {
  const { append, fields, remove } = useFieldArray({ control, name });

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
    field: ControllerRenderProps<
      FieldValues,
      `${string}.${number}.${string}.id`
    >
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      /* empty */
    }
  };

  // ✅ Watch all types at once outside the loop
  const types = useWatch({ control, name }) ?? [];

  return (
    <div className="space-y-2">
      {fields.map((field, i) => {
        const type = types[i]?.type;

        return (
          <div className="border p-3 rounded-md space-y-2" key={field.id}>
            <FormField
              control={control}
              name={`${name}.${i}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              <>
                <FormField
                  control={control}
                  name={`${name}.${i}.${String(type).toLowerCase()}.id`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text</FormLabel>
                      <FormControl>
                        {/* <Input {...field} placeholder="Enter text" /> */}
                        <FileUpload
                          {...field}
                          className="w-full max-w-md mx-auto"
                          maxSize={5 * 1024 * 1024}
                          onFileReject={onFileReject}
                          onValueChange={(files) => onFileUpload(files, field)}
                          value={Object.values(fileRecord)}
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
                                className="mt-2 w-fit"
                                size="sm"
                                variant="outline"
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
                                    className="size-7"
                                    size="icon"
                                    variant="ghost"
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
                <FormField
                  control={control}
                  name={`${name}.${i}.${String(type).toLowerCase()}.caption`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caption</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {type === ParametersTypesEnum.Document && (
                  <FormField
                    control={control}
                    name={`${name}.${i}.${String(type).toLowerCase()}.filename`}
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
              hidden={preview}
              onClick={() => remove(i)}
              type="button"
              variant="destructive"
            >
              Remove Parameter
            </Button>
          </div>
        );
      })}

      <Button
        hidden={preview}
        onClick={() =>
          append({
            type: ParametersTypesEnum.Text,
          })
        }
        type="button"
        variant="outline"
      >
        Add Parameter
      </Button>
    </div>
  );
}
