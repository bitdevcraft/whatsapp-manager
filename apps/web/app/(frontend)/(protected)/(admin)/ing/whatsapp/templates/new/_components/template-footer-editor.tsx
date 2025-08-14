/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";

export function FooterEditor({
  control,
  index,
}: {
  control: any;
  index: number;
}) {
  return (
    <FormField
      control={control}
      name={`components.${index}.text`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Footer Text</FormLabel>
          <FormControl>
            <Input placeholder="Footer text" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
