import { AutoFormFieldProps } from "@autoform/react";
import { Input } from "@workspace/ui/components/input";
import React from "react";

export const NumberField: React.FC<AutoFormFieldProps> = ({
  inputProps,
  error,
  id,
}) => {
  const { key, ...props } = inputProps;

  return (
    <Input
      id={id}
      type="number"
      className={error ? "border-destructive" : ""}
      {...props}
    />
  );
};
