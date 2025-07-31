"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { Plus, X } from "lucide-react";

type Props = {
  form: UseFormReturn<any>;
};

export function StepContent({ form }: Props) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "components",
  });

  const bodyComponent = fields.find(c => c.type === "BODY");
  const headerComponent = fields.find(c => c.type === "HEADER");

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Message Content</h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <FormLabel>Message Body</FormLabel>
          </div>
          <FormField
            control={form.control}
            name={`components.${fields.findIndex(c => c.type === "BODY")}.text`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Enter your message here..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Use {{1}} for variables. Example: "Hello {{1}}, your order {{2}} is ready!"</p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <FormLabel>Header (Optional)</FormLabel>
            {!headerComponent ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    type: "HEADER",
                    format: "TEXT",
                    text: "",
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Header
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(fields.findIndex(c => c.type === "HEADER"))}
              >
                <X className="mr-2 h-4 w-4" />
                Remove Header
              </Button>
            )}
          </div>
          
          {headerComponent && (
            <FormField
              control={form.control}
              name={`components.${fields.findIndex(c => c.type === "HEADER")}.text`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Enter header text..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Maximum 60 characters. Use sparingly for important information.</p>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
