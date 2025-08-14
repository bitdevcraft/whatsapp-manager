/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoArrayInputs } from "./template-auto-array";
import { AutoNamedParamsInputs } from "./template-auto-name-param";

export function HeaderAutoExamples({
  control,
  index,
  parameterFormat,
}: {
  control: any;
  index: number;
  parameterFormat: "POSITIONAL" | "NAMED";
}) {
  if (parameterFormat === "POSITIONAL") {
    return (
      <AutoArrayInputs
        control={control}
        baseName={`components.${index}.example.header_text`}
        label="Header Example Variables (auto)"
      />
    );
  }
  return (
    <AutoNamedParamsInputs
      control={control}
      baseName={`components.${index}.example.header_text_named_params`}
      label="Header Named Params (auto)"
    />
  );
}
