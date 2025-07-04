"use client";

import { S3FileUploader } from "@workspace/ui/components/file-uploader";
import { useTheme } from "next-themes";

export default function Home() {
  const { systemTheme } = useTheme();
  const onComplete = async (data: { url: string; size: number }[]) => {
  };

  return <S3FileUploader onComplete={onComplete} theme={systemTheme} />;
}
