/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useWatch } from "react-hook-form";

export function AutoMatrixRowInputs({
  control,
  baseName,
  label,
}: {
  control: any;
  baseName: string; // e.g. components.X.example.body_text.0
  label: string;
}) {
  const arr = useWatch({
    control,
    name: baseName as any,
  }) as string[] | undefined;

  const len = Array.isArray(arr) ? arr.length : 0;
  if (!len) return null;

  return (
    <div className="grid gap-2">
      <div className="text-sm">{label}</div>
      {Array.from({ length: len }).map((_, i) => (
        <FormField
          key={i}
          control={control}
          name={`${baseName}.${i}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Param {i + 1}</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
