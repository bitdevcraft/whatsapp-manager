import { AutoFormFieldProps } from "@autoform/react";
import { Input } from "@workspace/ui/components/input";
import React from "react";

export const DateField: React.FC<AutoFormFieldProps> = ({
  inputProps,
  error,
  id,
}) => {
  const { key, ...props } = inputProps;

  return (
    <Input
      id={id}
      type="date"
      className={error ? "border-destructive" : ""}
      {...props}
    />
  );
};
