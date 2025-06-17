import { useFieldArray, useWatch } from "react-hook-form";
import { Input } from "@workspace/ui/components/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { ParametersTypesEnum } from "@workspace/wa-cloud-api";

export function ComponentParametersArray({
  name,
  control,
}: {
  name: string;
  control: any;
}) {
  const { fields, append, remove } = useFieldArray({ name, control });

  // ✅ Watch all types at once outside the loop
  const types = useWatch({ control, name }) ?? [];

  return (
    <div className="space-y-2">
      {fields.map((field, i) => {
        const type = types[i]?.type;

        return (
          <div key={field.id} className="border p-3 rounded-md space-y-2">
            <FormField
              control={control}
              name={`${name}.${i}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ParametersTypesEnum).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {type === ParametersTypesEnum.Text && (
              <FormField
                control={control}
                name={`${name}.${i}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter text" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {type === ParametersTypesEnum.Currency && (
              <>
                <FormField
                  control={control}
                  name={`${name}.${i}.currency.fallback_value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fallback</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 100 USD" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`${name}.${i}.currency.code`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. USD" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`${name}.${i}.currency.amount_1000`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount x1000</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(i)}
            >
              Remove Parameter
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            type: ParametersTypesEnum.Text,
          })
        }
      >
        Add Parameter
      </Button>
    </div>
  );
}
