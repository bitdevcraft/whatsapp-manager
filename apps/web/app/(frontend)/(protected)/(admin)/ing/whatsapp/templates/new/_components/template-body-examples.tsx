/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoMatrixRowInputs } from "./template-auto-matrix";
import { AutoNamedParamsInputs } from "./template-auto-name-param";

export function BodyAutoExamples({
  index,
  parameterFormat,
}: {
  index: number;
  parameterFormat: "POSITIONAL" | "NAMED";
}) {
  if (parameterFormat === "POSITIONAL") {
    return (
      <AutoMatrixRowInputs
        baseName={`components.${index}.example.body_text.0`}
        label="Body Example Variables (auto)"
      />
    );
  }
  return (
    <AutoNamedParamsInputs
      baseName={`components.${index}.example.body_text_named_params`}
      label="Body Named Params (auto)"
    />
  );
}
