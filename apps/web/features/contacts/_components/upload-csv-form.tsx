"use client";
import { CsvImporter } from "@workspace/ui/components/data-importer";
import axios from "axios";
import { toast } from "sonner";

export default function UploadCSVContact() {
  const onImport = async (data: Record<string, unknown>[]) => {
    try {
      await axios.post("/api/contacts", data);
      toast.success("Contacts Inserted");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to Insert");
    }
  };

  return (
    <>
      <CsvImporter
        fields={[
          { label: "Name", value: "name" },
          { label: "Phone Number", value: "phoneNumber", required: true },
          { label: "Email", value: "email" },
        ]}
        onImport={onImport}
      />
    </>
  );
}
