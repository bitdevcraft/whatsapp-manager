/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoArrayInputs } from "./template-auto-array";
import { AutoNamedParamsInputs } from "./template-auto-name-param";

export function HeaderAutoExamples({
  index,
  parameterFormat,
}: {
  index: number;
  parameterFormat: "POSITIONAL" | "NAMED";
}) {
  if (parameterFormat === "POSITIONAL") {
    return (
      <AutoArrayInputs
        baseName={`components.${index}.example.header_text`}
        label="Header Example Variables (auto)"
      />
    );
  }
  return (
    <AutoNamedParamsInputs
      baseName={`components.${index}.example.header_text_named_params`}
      label="Header Named Params (auto)"
    />
  );
}
