"use client";

import React, { useEffect, useMemo } from "react";
import Uppy from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";
import { Dashboard } from "@uppy/react";

// import "@uppy/core/dist/style.css";
// import "@uppy/dashboard/dist/style.css";

export interface S3FileUploaderProps {
  onComplete?: (data: { url: string; size: number }[]) => void;
  /** default 10 MB */
  maxFileSize?: number;
  theme?: "dark" | "light";
  multiple?: boolean;
}

export function S3FileUploader({
  onComplete,
  maxFileSize = 20 * 1024 * 1024,
  theme = "light",
  multiple = false,
}: S3FileUploaderProps) {
  const uppy = useMemo(
    () =>
      new Uppy({
        autoProceed: false,
        restrictions: { maxFileSize },
        allowMultipleUploads: multiple,

        // @ts-expect-error aws
      }).use(AwsS3, {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async getUploadParameters(file, options) {
          const res = await fetch("/api/s3-presigned", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
            }),
          });

          if (!res.ok) throw new Error("Could not get presigned URL");

          const { url, fields } = (await res.json()) as {
            url: string;
            fields: Record<string, string>;
          };

          return {
            method: "POST",
            url,
            fields,
          };
        },
      }),
    [maxFileSize, multiple]
  );

  useEffect(() => {
    uppy.on("complete", (result) => {
      const urls = result.successful
        ?.map((f) => ({ url: f.uploadURL!, size: f.size! }))
        .filter(Boolean) as { url: string; size: number }[];

      onComplete?.(urls);
    });

    // return () => uppy.destroy();
  }, [uppy, onComplete]);

  return (
    <div className="rounded-2xl border border-muted p-4 shadow-sm">
      <Dashboard
        uppy={uppy}
        proudlyDisplayPoweredByUppy={false}
        height={350}
        note="Max 10 MB"
        theme={theme}
      />
    </div>
  );
}
