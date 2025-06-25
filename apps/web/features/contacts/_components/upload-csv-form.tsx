"use client";
import { CsvImporter } from "@workspace/ui/components/data-importer";

export default function UploadCSVContact() {
  return (
    <>
      <CsvImporter
        fields={[
          { label: "Name", value: "name", required: true },
          { label: "Phone Number", value: "phoneNumber" },
          { label: "Email", value: "email" },
        ]}
        onImport={(parsedData) => {
          console.log(parsedData);
        }}
      />
    </>
  );
}
