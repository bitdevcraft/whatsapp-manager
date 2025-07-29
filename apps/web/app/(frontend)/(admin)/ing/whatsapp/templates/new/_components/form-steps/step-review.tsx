"use client";

import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { format } from "date-fns";

type Props = {
  form: UseFormReturn<any>;
};

export function StepReview({ form }: Props) {
  const values = form.watch();
  
  const getCategoryName = (category: string) => {
    switch (category) {
      case "MARKETING":
        return "Marketing";
      case "UTILITY":
        return "Utility";
      case "AUTHENTICATION":
        return "Authentication";
      default:
        return category;
    }
  };

  const getButtonTypeName = (type: string) => {
    switch (type) {
      case "QUICK_REPLY":
        return "Quick Reply";
      case "URL":
        return "URL Button";
      case "PHONE_NUMBER":
        return "Call Button";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Review Your Template</h3>
        <p className="text-sm text-muted-foreground">
          Please review your template details before submission
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Template Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Template Name</p>
                <p className="font-medium">{values.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Category</p>
                <Badge variant="outline">
                  {getCategoryName(values.category)}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Language</p>
                <p>{values.language?.code?.toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Created</p>
                <p>{format(new Date(), "PPpp")}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Content</h4>
            <div className="space-y-4">
              {values.components?.find((c: any) => c.type === "HEADER") && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Header</p>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="font-medium">
                      {values.components.find((c: any) => c.type === "HEADER")?.text}
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Body</p>
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {values.components?.find((c: any) => c.type === "BODY")?.text}
                </div>
              </div>

              {values.components?.find((c: any) => c.buttons?.length > 0) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Buttons</p>
                  <div className="space-y-2">
                    {values.components
                      .find((c: any) => c.buttons?.length > 0)
                      ?.buttons?.map((button: any, index: number) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{button.text}</p>
                              <p className="text-sm text-muted-foreground">
                                {getButtonTypeName(button.type)}
                              </p>
                            </div>
                            {button.url && (
                              <a 
                                href={button.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {button.url}
                              </a>
                            )}
                            {button.phone_number && (
                              <p className="text-sm">
                                {button.phone_number}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
