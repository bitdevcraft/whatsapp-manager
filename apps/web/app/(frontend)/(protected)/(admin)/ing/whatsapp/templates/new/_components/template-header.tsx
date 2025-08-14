/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWatch } from "react-hook-form";
import { HeaderEditor } from "./template-header-editor";
import { HeaderAutoExamples } from "./template-header-examples";
import { HeaderFileField } from "./template-header-file-field";
import { HeaderFormatOption } from "./template-header-format-option";

export function HeaderField({
  control,
  index,
  parameterFormat,
  syncExamples,
}: {
  control: any;
  index: number;
  parameterFormat: "POSITIONAL" | "NAMED";
  syncExamples: (opts?: {
    headerTextOverride?: string;
    bodyTextOverride?: string;
  }) => void;
}) {
  const format = useWatch({
    control,
    name: `components.${index}.format` as const,
  }) as "IMAGE" | "TEXT";

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">HEADER</div>
      </div>

      <HeaderFormatOption index={index} />

      {format === "TEXT" && (
        <HeaderEditor
          index={index}
          parameterFormat={parameterFormat}
          syncExamples={syncExamples}
        />
      )}
      {format === "IMAGE" && (
        <HeaderFileField name={`components.${index}.example.header_handle.0`} />
      )}
      <HeaderAutoExamples index={index} parameterFormat={parameterFormat} />
    </div>
  );
}
