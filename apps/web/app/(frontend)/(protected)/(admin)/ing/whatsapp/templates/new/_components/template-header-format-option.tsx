import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

const headerFormatOptions = ["TEXT", "IMAGE"] as const;

export function HeaderFormatOption({
  control,
  index,
}: {
  control: any;
  index: number;
}) {
  return (
    <FormField
      control={control}
      name={`components.${index}.format`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Header Format</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={field.onChange}>
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
