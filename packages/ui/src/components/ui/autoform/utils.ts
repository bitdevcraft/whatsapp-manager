import { buildZodFieldConfig } from "@autoform/react";
import { FieldTypes } from "./AutoForm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fieldConfig: any = buildZodFieldConfig<
  FieldTypes,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {
    // Add types for `customData` here.
  }
>();
