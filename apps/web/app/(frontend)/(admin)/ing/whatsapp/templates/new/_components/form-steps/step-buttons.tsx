"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Plus, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";

type Props = {
  form: UseFormReturn<any>;
};

type ButtonType = "QUICK_REPLY" | "URL" | "PHONE_NUMBER";

interface ButtonField {
  type: ButtonType;
  text: string;
  url?: string;
  phone_number?: string;
}

export function StepButtons({ form }: Props) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "components.0.buttons",
  });

  const addButton = (type: ButtonType) => {
    if (fields.length >= 3) return;
    
    const newButton: ButtonField = { type, text: "" };
    if (type === "URL") newButton.url = "";
    if (type === "PHONE_NUMBER") newButton.phone_number = "";
    
    append(newButton);
  };

  const removeButton = (index: number) => {
    remove(index);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Buttons (Optional)</h3>
        <p className="text-sm text-muted-foreground">
          Add up to 3 buttons to your template
        </p>
      </div>

      {fields.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No buttons added</AlertTitle>
          <AlertDescription>
            Buttons are optional but can increase engagement. You can add up to 3 buttons.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">
                Button {index + 1} - {field.type === "QUICK_REPLY" ? "Quick Reply" : field.type === "URL" ? "Call to Action" : "Phone Number"}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeButton(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <FormField
              control={form.control}
              name={`components.0.buttons.${index}.text`}
              render={({ field: buttonField }) => (
                <FormItem>
                  <FormLabel>Button Text</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Button text"
                      maxLength={25}
                      {...buttonField}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum 25 characters
                  </p>
                </FormItem>
              )}
            />

            {field.type === "URL" && (
              <FormField
                control={form.control}
                name={`components.0.buttons.${index}.url`}
                render={({ field: urlField }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...urlField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {field.type === "PHONE_NUMBER" && (
              <FormField
                control={form.control}
                name={`components.0.buttons.${index}.phone_number`}
                render={({ field: phoneField }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1234567890"
                        {...phoneField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        ))}
      </div>

      {fields.length < 3 && (
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addButton("QUICK_REPLY")}
            disabled={fields.length >= 3}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Quick Reply
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addButton("URL")}
            disabled={fields.length >= 3}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add URL Button
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addButton("PHONE_NUMBER")}
            disabled={fields.length >= 3}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Call Button
          </Button>
        </div>
      )}
    </div>
  );
}
