/* eslint-disable @typescript-eslint/no-explicit-any */
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
  FormMessage,
} from "@workspace/ui/components/form";
import { Upload } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";

import { onFileReject, onHeaderFileUpload } from "../_lib/upload-helpers";

export function HeaderFileField({ name }: { name: string }) {
  const { control } = useFormContext();

  const [files, setFiles] = React.useState<File[]>([]);

  return (
    <FormField
      control={control}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Image</FormLabel>
          <FormControl>
            <FileUpload
              className="w-full max-w-md mx-auto"
              maxSize={5 * 1024 * 1024}
              onFileReject={onFileReject}
              onValueChange={(next) => {
                setFiles(next);
                // Upload on add; clear value on delete
                if (next.length > 0) {
                  onHeaderFileUpload(next, field);
                } else {
                  field.onChange(undefined);
                }
              }}
              value={files}
            >
              <FileUploadDropzone>
                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="flex items-center justify-center rounded-full border p-2.5">
                    <Upload className="size-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm">Drag & drop files here</p>
                  <p className="text-muted-foreground text-xs">
                    Or click to browse (max 5MB)
                  </p>
                </div>
                <FileUploadTrigger asChild>
                  <Button className="mt-2 w-fit" size="sm" variant="outline">
                    Browse files
                  </Button>
                </FileUploadTrigger>
              </FileUploadDropzone>

              {/* ✅ The list is back */}
              <FileUploadList>
                {files.map((file, i) => (
                  <FileUploadItem key={i} value={file}>
                    <FileUploadItemPreview />
                    <FileUploadItemMetadata />
                    <FileUploadItemDelete />
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
