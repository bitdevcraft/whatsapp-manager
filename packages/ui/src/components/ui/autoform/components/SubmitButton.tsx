import React from "react";
import { Button } from "@workspace/ui/components/button";

export const SubmitButton: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <Button type="submit">{children}</Button>;
