"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useWatch } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { ParametersTypesEnum } from "@workspace/wa-cloud-api";

export function ComponentButtonParameter({
  name,
  control,
}: {
  name: string;
  control: any;
}) {
  const type = useWatch({ control, name: `${name}.type` });

  return (
    <div className="space-y-2">
      <FormField
        control={control}
        name={`${name}.type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parameter Type</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {[ParametersTypesEnum.Text, ParametersTypesEnum.Payload].map(
                  (val) => (
                    <SelectItem key={val} value={val}>
                      {val}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {type === ParametersTypesEnum.Text && (
        <FormField
          control={control}
          name={`${name}.text`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {type === ParametersTypesEnum.Payload && (
        <FormField
          control={control}
          name={`${name}.payload`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payload</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
