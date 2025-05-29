import { useMultiStepFormContext } from "@/components/forms/multi-step-form";
import { FormSchema } from "./marketing-campaign-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

function DetailsStep() {
  const { form, prevStep } = useMultiStepFormContext<typeof FormSchema>();

  return (
    <Form {...form}>
      <div className={"flex flex-col gap-4"}>
        <FormField
          name="template.template"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Template</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type={"button"} variant={"outline"} onClick={prevStep}>
            Back
          </Button>

          <Button type={"submit"}>Submit</Button>
        </div>
      </div>
    </Form>
  );
}

export default DetailsStep;
