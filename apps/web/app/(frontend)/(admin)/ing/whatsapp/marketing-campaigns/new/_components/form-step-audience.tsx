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

function AudienceStep() {
  const { form, nextStep, prevStep } =
    useMultiStepFormContext<typeof FormSchema>();

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

        <div className="flex justify-end  gap-2">
          <Button type={"button"} variant={"outline"} onClick={prevStep}>
            Previous
          </Button>

          <Button onClick={nextStep}>Next</Button>
        </div>
      </div>
    </Form>
  );
}

export default AudienceStep;
