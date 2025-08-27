import { ExtendableAutoFormProps } from "@autoform/react";
import { FieldValues } from "react-hook-form";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AutoFormProps<T extends FieldValues>
  extends ExtendableAutoFormProps<T> {}
