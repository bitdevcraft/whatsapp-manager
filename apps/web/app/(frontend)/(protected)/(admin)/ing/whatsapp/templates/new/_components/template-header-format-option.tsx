import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useFormContext } from "react-hook-form";

const headerFormatOptions = [
  "TEXT",
  "IMAGE",
  "VIDEO",
  "DOCUMENT",
  "PRODUCT",
] as const;

export function HeaderFormatOption({ index }: { index: number }) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={`components.${index}.format`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Header Format</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {headerFormatOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
