/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { ControllerRenderProps } from "react-hook-form";
import { toast } from "sonner";

export async function onWhatsAppMediaFileUpload(
  data: File[],
  phoneNumber: string,
  field: ControllerRenderProps<any, any>,
  mediaType: "IMAGE" | "VIDEO" | "DOCUMENT"
) {
  const file = data[0];
  if (!file) return false;

  // ✅ Validate file type based on mediaType
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
    toast.error(`Invalid file type for ${mediaType}`);
    return false;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(
      `/api/whatsapp/files/${phoneNumber}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    field.onChange(response.data.id);

    return true;
  } catch (err: any) {
    toast.error(err?.message ?? "Upload error");
    return false;
  }
}

export const onFileReject = (file: File, message: string) => {
  toast(message, {
    description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
  });
};
