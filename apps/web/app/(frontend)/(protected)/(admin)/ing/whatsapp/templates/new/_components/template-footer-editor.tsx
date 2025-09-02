 
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useFormContext } from "react-hook-form";

export function FooterEditor({ index }: { index: number }) {
  const { control } = useFormContext();

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
