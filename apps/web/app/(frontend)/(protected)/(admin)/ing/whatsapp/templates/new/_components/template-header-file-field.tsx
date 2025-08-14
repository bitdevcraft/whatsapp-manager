/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@workspace/ui/components/button";
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
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import { Upload } from "lucide-react";
import React from "react";
import { onHeaderFileUpload, onFileReject } from "../_lib/upload-helpers";

export function HeaderFileField({
  control,
  name,
}: {
  control: any;
  name: string;
}) {
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
              value={files}
              onValueChange={(next) => {
                setFiles(next);
                // Upload on add; clear value on delete
                if (next.length > 0) {
                  onHeaderFileUpload(next, field);
                } else {
                  field.onChange(undefined);
                }
              }}
              maxSize={5 * 1024 * 1024}
              className="w-full max-w-md mx-auto"
              onFileReject={onFileReject}
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
                  <Button variant="outline" size="sm" className="mt-2 w-fit">
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
