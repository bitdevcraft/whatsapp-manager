/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { ControllerRenderProps } from "react-hook-form";
import { toast } from "sonner";

export async function onWhatsAppMediaFileUpload(
  data: File[],
  phoneNumber: string,
  field: ControllerRenderProps<any, any>
) {
  const file = data[0];
  if (!file) return;
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
  } catch (err: any) {
    toast.error(err?.message ?? "Upload error");
  }
}

export const onFileReject = (file: File, message: string) => {
  toast(message, {
    description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
  });
};
